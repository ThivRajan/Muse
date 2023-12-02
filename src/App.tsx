import { ChangeEvent, useEffect, useRef, useState } from "react";
import { downloadCoverLetter } from "./utils/download-cover-letter.util";
import { parsePdf } from "./utils/parse-pdf.util";
import {
  getResumeFromStorage,
  saveResumeToStorage,
} from "./utils/resume-storage.util";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [resume, setResume] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getResumeFileName();
  }, []);

  const clearResumeFile = () => {
    // TODO: Find a way to clear only local storage related to app
    chrome.storage.local.clear();
    setResumeFileName("");
  };

  const getResumeFileName = async () => {
    const fileName = await chrome.storage.local.get("resumeFileName");
    const resume = await getResumeFromStorage();
    if (fileName) {
      setResumeFileName(fileName.resumeFileName);
      setResume(resume);
    }
  };

  const handleResumeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const resumeFile = event.target.files?.[0];
    const resumeFileName = resumeFile?.name || "";
    const resumeFileContents = await resumeFile?.arrayBuffer();

    if (resumeFileContents) {
      await saveResumeToStorage(resumeFileContents, resumeFileName);
      const parsedResume = await parsePdf(resumeFileContents);
      setResumeFileName(resumeFileName);
      setResume(parsedResume);
    } else {
      console.error("Unable to read file");
    }
  };

  return (
    <div className="w-[300px] p-8 flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-black">Muses</h1>
      <div>
        <input
          type="file"
          id="resumeInput"
          ref={resumeInputRef}
          className="hidden"
          onChange={handleResumeChange}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="resumeInput" className="flex gap-2 items-center">
            <span className="bg-red-300 rounded w-fit p-1 text-white text-md cursor-pointer">
              Choose Resume
            </span>
            {resumeFileName ? (
              <span>{resumeFileName}</span>
            ) : (
              <span>No resume chosen</span>
            )}
          </label>
          <span
            className="hover:text-red-500 cursor-pointer text-lg"
            onClick={clearResumeFile}
          >
            X
          </span>
        </div>
      </div>
      <button
        className="text-xl bg-blue-500 text-white p-2 rounded hover:brightness-75"
        onClick={() => downloadCoverLetter(resume, setIsLoading)}
      >
        Download Cover Letter
      </button>
      {isLoading && <span>Loading...</span>}
    </div>
  );
}
