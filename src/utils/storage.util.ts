import { parsePdf } from "./parse-pdf.util";

const CHUNK_SIZE = 1024 * 100;

// Convert chunk into chrome storage friendly form before storing
function setChunkInStorage(key: string, chunk: ArrayBuffer) {
  return new Promise<void>((resolve) => {
    const binary = new Uint8Array(chunk).reduce(
      (acc, currByte) => acc + String.fromCharCode(currByte),
      ""
    );
    const base64String = btoa(binary);
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

export async function loadFile(fileContents: ArrayBuffer) {
  // TODO: only clear keys that start with "resumeData_"
  chrome.storage.local.clear();

  // Split the array buffer into storable chunks
  const chunks: ArrayBuffer[] = [];
  for (let i = 0; i < fileContents.byteLength; i += CHUNK_SIZE) {
    const chunk = fileContents.slice(i, i + CHUNK_SIZE);
    chunks.push(chunk);
  }

  chunks.forEach(async (chunk, index) => {
    await setChunkInStorage(`resumeData_${index}`, chunk);
  });
}

export async function parseResume() {
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
}
