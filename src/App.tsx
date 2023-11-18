import { displayJob } from "./display-job.util";

export default function App() {
  const readDOM = async () => {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: displayJob,
    });
  };

  return (
    <div className="w-[300px] p-8">
      <h1 className="text-3xl font-bold text-blue-700">Hello world!</h1>
      <button
        className="text-xl bg-blue-500 text-white p-2 rounded hover:brightness-75"
        onClick={readDOM}
      >
        Read DOM Content
      </button>
    </div>
  );
}
