import { useState } from "react";
import { displayCoverLetter } from "./utils/generate-cover-letter.util";
import { parseJob } from "./utils/parse-job.util";
import { parseResume, saveFile } from "./utils/storage.util";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

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

  const saveResume = async () => {
    const resumeInput = document.getElementById(
      "resumeInput"
    ) as HTMLInputElement;
    const resumeFile = resumeInput.files?.[0];
    const fileContents = await resumeFile?.arrayBuffer();

    if (fileContents) {
      saveFile(fileContents);
    } else {
      console.error("Unable to read file");
    }
  };

  return (
    <div className="w-[300px] p-8 flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-black">Hello world!</h1>
      <button
        className="text-xl bg-yellow-500 text-white p-2 rounded hover:brightness-75"
        onClick={handleJobParsing}
      >
        Parse Job Text
      </button>
      <input type="file" id="resumeInput" />
      <button
        className="text-xl bg-green-500 text-white p-2 rounded hover:brightness-75"
        onClick={saveResume}
      >
        Save Resume
      </button>
      <button
        className="text-xl bg-blue-500 text-white p-2 rounded hover:brightness-75"
        onClick={parseResume}
      >
        Parse Resume
      </button>
      <button
        className="text-xl bg-gray-500 text-white p-2 rounded hover:brightness-75"
        onClick={() => displayCoverLetter(setIsLoading)}
      >
        Show Cover Letter
      </button>
      {isLoading && <span>Loading...</span>}
    </div>
  );
}
