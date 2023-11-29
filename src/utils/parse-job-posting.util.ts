export async function parseJobPosting() {
  const getJobPostingClass = () => {
    const url = window.location.toString();
    const hostname = url
      .replace("http://", "")
      .replace("https://", "")
      .split("/")[0];

    switch (hostname) {
      case "ca.indeed.com":
        return "fastviewjob jobsearch-ViewJobLayout--embedded css-1lo7kga eu4oa1w0";
      case "www.linkedin.com":
        return "job-view-layout jobs-details";
      default:
        return "";
    }
  };

  const jobContent = document
    .getElementsByClassName(getJobPostingClass())
    .item(0);

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

  const jobPostingText = jobContent
    ? getTextContent(jobContent as HTMLElement)
    : "";

  await chrome.runtime.sendMessage({ jobPostingText });
}
