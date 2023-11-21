import { parseJob } from "./utils/parse-job.util";
import { parsePdf } from "./utils/parse-pdf.util";

const CHUNK_SIZE = 1024 * 100;

function setChunkInStorage(key: string, chunk: ArrayBuffer) {
  return new Promise<void>((resolve) => {
    const uintArray = new Uint8Array(chunk);

    // Convert Uint8Array to base64 string
    let binary = "";
    uintArray.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    let base64String = btoa(binary);

    // Store the base64 string in Chrome storage
    chrome.storage.local.set({ [key]: base64String }, () => {
      resolve();
    });
  });
}

function getAllChunksFromStorage() {
  return new Promise<{ [key: string]: any }>((resolve) => {
    chrome.storage.local.get(null, (items) => {
      resolve(items);
    });
  });
}

export default function App() {
  const handleJobParsing = async () => {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: parseJob,
    });
  };

  const loadResume = async () => {
    const resumeInput = document.getElementById(
      "resumeInput"
    ) as HTMLInputElement;
    const resumeFile = resumeInput.files?.[0];
    const fileContents = await resumeFile?.arrayBuffer();

    if (fileContents) {
      chrome.storage.local.clear();
      // Split the array buffer into chunks
      const chunks: ArrayBuffer[] = [];
      for (let i = 0; i < fileContents.byteLength; i += CHUNK_SIZE) {
        const chunk = fileContents.slice(i, i + CHUNK_SIZE);
        chunks.push(chunk);
      }

      // Store the chunks in Chrome storage
      for (let j = 0; j < chunks.length; j++) {
        await setChunkInStorage(`resumeData_${j}`, chunks[j]);
      }
    } else {
      console.error("Unable to read file");
    }
  };

  const parseResume = async () => {
    const items = await getAllChunksFromStorage();

    // Find all keys that contain chunks of the file
    const chunkKeys = Object.keys(items).filter((key) =>
      key.startsWith("resumeData_")
    );

    // Sort chunk keys based on the index (resumeData_0, resumeData_1, ...)
    chunkKeys.sort((a, b) => {
      const indexA = parseInt(a.split("_")[1]);
      const indexB = parseInt(b.split("_")[1]);
      return indexA - indexB;
    });

    // Create an ArrayBuffer to hold the reconstructed file
    const totalSize = chunkKeys.length * CHUNK_SIZE;
    const reconstructedArrayBuffer = new ArrayBuffer(totalSize);
    const uint8Array = new Uint8Array(reconstructedArrayBuffer);

    // Reconstruct the file from chunks
    let offset = 0;
    for (const key of chunkKeys) {
      const base64String = items[key];
      const binaryString = atob(base64String);

      // Convert base64 string to Uint8Array
      const chunkUint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        chunkUint8Array[i] = binaryString.charCodeAt(i);
      }

      // Copy chunk data to the reconstructed ArrayBuffer
      uint8Array.set(chunkUint8Array, offset);
      offset += CHUNK_SIZE;
    }

    const resumeFile = reconstructedArrayBuffer;

    parsePdf(resumeFile);
  };

  return (
    <div className="w-[300px] p-8">
      <h1 className="text-3xl font-bold text-blue-700">Hello world!</h1>
      <button
        className="text-xl bg-blue-500 text-white p-2 rounded hover:brightness-75"
        onClick={handleJobParsing}
      >
        Parse Job Text
      </button>
      <input type="file" id="resumeInput" />
      <button
        className="text-xl bg-green-500 text-white p-2 rounded hover:brightness-75"
        onClick={loadResume}
      >
        Load Resume
      </button>
      <button
        className="text-xl bg-red-500 text-white p-2 rounded hover:brightness-75"
        onClick={parseResume}
      >
        Parse Resume
      </button>
    </div>
  );
}
