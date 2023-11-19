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

  return (
    <div className="w-[300px] p-8">
      <h1 className="text-3xl font-bold text-blue-700">Hello world!</h1>
      <button
        className="text-xl bg-blue-500 text-white p-2 rounded hover:brightness-75"
        onClick={handleJobParsing}
      >
        Parse Job Text
      </button>
      <button
        className="text-xl bg-red-500 text-white p-2 rounded hover:brightness-75"
        onClick={parsePdf}
      >
        Parse PDF
      </button>
    </div>
  );
}
