import { ChangeEvent, useEffect, useState } from "react";
import { FaDownload, FaFileArrowUp, FaFileLines } from "react-icons/fa6";
import { RiCloseFill } from "react-icons/ri";
import { Tooltip } from "react-tooltip";
import Loader from "./Loader";
import { downloadCoverLetter } from "./utils/download-cover-letter.util";
import { parseResume } from "./utils/parse-resume.util";
import {
  clearResume,
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

  const tooltipId = "download-disabled-tooltip";
  const tooltipContent = resumeFile.contents
    ? ""
    : "You must upload a resume to generate a cover letter.";

  useEffect(() => {
    getResumeFile();
  }, []);

  const clearResumeFile = async () => {
    await clearResume();
    setResumeFile(INITIAL_RESUME_FILE);
  };

  const getResumeFile = async () => {
    const resumeFile = await getResumeFromStorage();
    if (resumeFile) {
      setResumeFile(resumeFile);
    }
  };

  const handleResumeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const resumeFile = event.target.files?.[0];
    const resumeFileName = resumeFile?.name || "";
    const fileExtension = resumeFileName.split(".")[1];
    const resumeFileContents = await resumeFile?.arrayBuffer();

    if (
      resumeFileContents &&
      (fileExtension === "pdf" || fileExtension === "docx")
    ) {
      await saveResumeToStorage(resumeFileContents, resumeFileName);
      const parsedContents = await parseResume(
        resumeFileContents,
        fileExtension
      );
      setResumeFile({
        name: resumeFileName,
        contents: parsedContents,
      });
    } else {
      console.error("Unable to read file");
    }
  };

  return (
    <div className="w-[330px] p-8 flex flex-col gap-2 bg-indigo-100 font-body">
      <h1 className="text-3xl font-bold text-black">Muse</h1>
      <div className="flex items-center justify-between p-2 bg-indigo-300 shadow-md rounded text-xl ">
        <input
          type="file"
          id="resumeInput"
          className="hidden"
          onChange={handleResumeChange}
        />
        <label
          htmlFor="resumeInput"
          className="flex gap-2 px-1 items-center cursor-pointer transition hover:text-indigo-700 hover:underline"
        >
          {resumeFile.name ? (
            <>
              <FaFileLines />
              {resumeFile.name}
            </>
          ) : (
            <>
              <FaFileArrowUp />
              Upload Resume
            </>
          )}
        </label>
        {!!resumeFile.name && (
          <RiCloseFill
            className="hover:text-red-500 cursor-pointer text-3xl transition"
            onClick={clearResumeFile}
          />
        )}
      </div>
      <button
        className="flex gap-2 py-2 justify-center items-center text-xl disabled:bg-gray-500 bg-indigo-600 hover:bg-indigo-800 text-slate-300 rounded transition"
        onClick={() => downloadCoverLetter(resumeFile.contents, setIsLoading)}
        disabled={!resumeFile.contents}
        data-tooltip-id={resumeFile.contents ? "" : tooltipId}
        data-tooltip-content={tooltipContent}
      >
        <FaDownload /> Download Cover Letter
      </button>
      <Loader isLoading={isLoading} />
      <Tooltip
        id={tooltipId}
        style={{ fontSize: "1rem", width: "30ch", textAlign: "center" }}
      />
    </div>
  );
}
