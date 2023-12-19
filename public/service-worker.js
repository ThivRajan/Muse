chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]?.id === tabId && changeInfo.status === "complete") {
      await updateIcon(tab);
    }
  });
});

chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]) {
      await updateIcon(tabs[0]);
    }
  });
});

async function updateIcon(tab) {
  const jobBoardFound = await isJobBoardFound(tab);
  await chrome.action.setIcon({
    tabId: tab.id,
    path: jobBoardFound ? "logo-active-38.png" : "logo-inactive-38.png",
  });
}

async function isJobBoardFound(tab) {
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
  return JOB_BOARDS.includes(hostname);
}
