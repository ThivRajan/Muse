export default function App() {
  const readDOM = async () => {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        const domContent = document.documentElement;
        const getTextContent = (element: HTMLElement) => {
          const range = document.createRange();
          range.selectNode(element);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);

          const textContent = selection?.toString();
          selection?.removeAllRanges();

          return textContent;
        };

        const textContent = getTextContent(domContent);
        alert(textContent);
      },
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
