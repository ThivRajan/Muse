import { ChangeEvent, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { downloadCoverLetter } from "./utils/download-cover-letter.util";
import { parsePdf } from "./utils/parse-pdf.util";
import {
  getResumeFromStorage,
  saveResumeToStorage,
} from "./utils/resume-storage.util";

const INITIAL_RESUME_FILE = {
  name: "",
  contents: "",
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(INITIAL_RESUME_FILE);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getResumeFileName();
  }, []);

  const clearResumeFile = () => {
    // TODO: Find a way to clear only local storage related to app
    chrome.storage.local.clear();
    setResumeFile(INITIAL_RESUME_FILE);
  };

  const getResumeFileName = async () => {
    const name = await chrome.storage.local.get("resumeFileName");
    const contents = await getResumeFromStorage();
    if (name && contents) {
      setResumeFile({
        name: name.resumeFileName,
        contents,
      });
    }
  };

  const handleResumeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const resumeFile = event.target.files?.[0];
    const resumeFileName = resumeFile?.name || "";
    const resumeFileContents = await resumeFile?.arrayBuffer();

    if (resumeFileContents) {
      await saveResumeToStorage(resumeFileContents, resumeFileName);
      const parsedContents = await parsePdf(resumeFileContents);
      setResumeFile({
        name: resumeFileName,
        contents: parsedContents,
      });
    } else {
      console.error("Unable to read file");
    }
  };

  return (
    <div className="w-[300px] p-8 flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-black">Muses</h1>
      <div className="flex items-center justify-between p-2 bg-gray-200 rounded text-xl">
        <input
          type="file"
          id="resumeInput"
          ref={resumeInputRef}
          className="hidden"
          onChange={handleResumeChange}
        />
        <label
          htmlFor="resumeInput"
          className="cursor-pointer hover:text-gray-600 hover:underline transition"
        >
          {resumeFile.name || "Choose resume"}
        </label>
        {!!resumeFile.name && (
          <MdClose
            className="hover:text-red-500 cursor-pointer text-2xl transition"
            onClick={clearResumeFile}
          />
        )}
      </div>
      <button
        className="text-xl bg-blue-500 hover:bg-blue-700 text-white p-2 rounded transition"
        onClick={() => downloadCoverLetter(resumeFile.contents, setIsLoading)}
      >
        Download Cover Letter
      </button>
      {isLoading && <span>Loading...</span>}
    </div>
  );
}
