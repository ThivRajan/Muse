import { parseJob } from "./utils/parse-job.util";
import { parsePdf } from "./utils/parse-pdf.util";

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

  const parseResume = async () => {
    const resumeInput = document.getElementById(
      "resumeInput"
    ) as HTMLInputElement;
    // TODO: figure out how to read the content of this file
    const resumeFile = resumeInput.files?.[0];
    const fileContents = await resumeFile?.arrayBuffer();
    if (fileContents) {
      parsePdf(fileContents);
    } else {
      alert("Unable to read file");
    }
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
        className="text-xl bg-red-500 text-white p-2 rounded hover:brightness-75"
        onClick={parseResume}
      >
        Parse Resume
      </button>
    </div>
  );
}
