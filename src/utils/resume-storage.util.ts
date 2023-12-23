import { parseResume } from "./parse-resume.util";

const RESUME_CHUNK_SIZE = 1024 * 100;
const RESUME_KEY_PREFIX = "resumeData_";

export async function clearResume() {
  const items = await getAllItemsFromStorage();
  const resumeChunkKeys = Object.keys(items).filter((key) =>
    key.startsWith(RESUME_KEY_PREFIX)
  );
  await chrome.storage.local.remove(["resumeFileName", ...resumeChunkKeys]);
}

export async function saveResumeToStorage(
  resumeFileContent: ArrayBuffer,
  resumeFileName: string
) {
  await clearResume();
  chrome.storage.local.set({ resumeFileName });

  // Split the array buffer into storable chunks
  const chunks: ArrayBuffer[] = [];
  for (let i = 0; i < resumeFileContent.byteLength; i += RESUME_CHUNK_SIZE) {
    const chunk = resumeFileContent.slice(i, i + RESUME_CHUNK_SIZE);
    chunks.push(chunk);
  }

  chunks.forEach(async (chunk, index) => {
    await setChunkInStorage(`${RESUME_KEY_PREFIX}${index}`, chunk);
  });
}

export async function getResumeFromStorage() {
  const storedName = await chrome.storage.local.get("resumeFileName");
  if (!storedName) return;

  const fileName = storedName.resumeFileName;
  const fileExtension: "pdf" | "docx" = fileName.split(".")[1];

  const items = await getAllItemsFromStorage();

  const resumeChunkKeys = Object.keys(items)
    .filter((key) => key.startsWith(RESUME_KEY_PREFIX))
    .sort(
      (keyA, keyB) =>
        parseInt(keyA.split("_")[1]) - parseInt(keyB.split("_")[1])
    );

  const totalSize = resumeChunkKeys.length * RESUME_CHUNK_SIZE;
  const resumeFile = new ArrayBuffer(totalSize);
  const uint8Array = new Uint8Array(resumeFile);

  // Reconstruct the file from chunks
  let offset = 0;
  for (const key of resumeChunkKeys) {
    const base64String = items[key];
    const binaryString = atob(base64String);

    // Convert base64 string to Uint8Array
    const chunkUint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      chunkUint8Array[i] = binaryString.charCodeAt(i);
    }

    // Copy chunk data to the reconstructed ArrayBuffer
    uint8Array.set(chunkUint8Array, offset);
    offset += RESUME_CHUNK_SIZE;
  }

  const fileContents = await parseResume(resumeFile, fileExtension);
  return {
    name: fileName,
    contents: fileContents,
  };
}

// Convert chunk into storage-friendly format before storing
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

function getAllItemsFromStorage() {
  return new Promise<{ [key: string]: any }>((resolve) => {
    chrome.storage.local.get(null, (items) => {
      resolve(items);
    });
  });
}
