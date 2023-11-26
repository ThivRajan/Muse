export async function parseJobPosting() {
  const getJobPostingClass = () => {
    const url = window.location.toString();

    if (url.startsWith("https://ca.indeed.com/")) {
      return "fastviewjob jobsearch-ViewJobLayout--embedded css-1lo7kga eu4oa1w0";
    } else if (url.startsWith("https://www.linkedin.com")) {
      return "job-view-layout jobs-details";
    } else {
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
