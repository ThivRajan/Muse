chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]?.id !== tabId || changeInfo.status !== "complete") return;
    const hostname = tab.url
      .replace("http://", "")
      .replace("https://", "")
      .split("/")[0];
    const JOB_BOARDS = [
      "ca.indeed.com",
      "smartapply.indeed.com",
      "m5.apply.indeed.com",
      "www.linkedin.com",
      "www.monster.ca",
      "www.glassdoor.ca",
      "www.careerbuilder.ca",
    ];
    chrome.action.setIcon({
      tabId,
      path: JOB_BOARDS.includes(hostname)
        ? "logo-active-38.png"
        : "logo-inactive-38.png",
    });
  });
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    const hostname = (tab.url || "")
      .replace("http://", "")
      .replace("https://", "")
      .split("/")[0];
    const JOB_BOARDS = [
      "ca.indeed.com",
      "smartapply.indeed.com",
      "m5.apply.indeed.com",
      "www.linkedin.com",
      "www.monster.ca",
      "www.glassdoor.ca",
      "www.careerbuilder.ca",
    ];
    chrome.action.setIcon({
      tabId,
      path: JOB_BOARDS.includes(hostname)
        ? "logo-active-38.png"
        : "logo-inactive-38.png",
    });
  });
});
