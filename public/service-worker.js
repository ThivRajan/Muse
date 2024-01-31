chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async ({ url }) => {
    if (url) {
      chrome.tabs.create({ url });
    }
  });
});
