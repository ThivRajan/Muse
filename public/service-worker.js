chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async ({ donationPage }) => {
    if (donationPage) {
      chrome.tabs.create({ url: donationPage });
    }
  });
});
