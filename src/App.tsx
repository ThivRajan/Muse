import { useEffect, useState } from "react";
import { downloadCoverLetter } from "./utils/download-cover-letter.util";
import { saveResumeToStorage } from "./utils/resume-storage.util";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");

  useEffect(() => {
    getResumeFileName();
  }, []);

  const getResumeFileName = async () => {
    const fileName = await chrome.storage.local.get("resumeFileName");
    if (fileName) {
      setResumeFileName(fileName.resumeFileName);
    }
  };

  const saveResume = async () => {
    const resumeInput = document.getElementById(
      "resumeInput"
    ) as HTMLInputElement;
    const resumeFile = resumeInput.files?.[0];
    const resumeFileName = resumeFile?.name || "";
    const resumeFileContents = await resumeFile?.arrayBuffer();

    if (resumeFileContents) {
      await saveResumeToStorage(resumeFileContents, resumeFileName);
      setResumeFileName(resumeFileName);
    } else {
      console.error("Unable to read file");
    }
  };

  return (
    <div className="w-[300px] p-8 flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-black">Muses</h1>
      <input type="file" id="resumeInput" />
      {!!resumeFileName && <span>{resumeFileName}</span>}
      <button
        className="text-xl bg-green-500 text-white p-2 rounded hover:brightness-75"
        onClick={saveResume}
      >
        Save Resume
      </button>
      <button
        className="text-xl bg-blue-500 text-white p-2 rounded hover:brightness-75"
        onClick={() => downloadCoverLetter(setIsLoading)}
      >
        Download Cover Letter
      </button>
      {isLoading && <span>Loading...</span>}
    </div>
  );
}
