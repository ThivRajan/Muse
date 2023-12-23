export function clearResume() {
  // TODO: Find a way to clear only local storage related to app
  chrome.storage.local.clear();
}
