export async function parseJobPosting() {
  const getJobPostingClass = () => {
    const url = window.location.toString();
    const hostname = url
      .replace("http://", "")
      .replace("https://", "")
      .split("/")[0];

    switch (hostname) {
      case "ca.indeed.com":
        return [
          "fastviewjob jobsearch-ViewJobLayout--embedded css-1lo7kga eu4oa1w0",
          "jobsearch-JobComponent css-u4y1in eu4oa1w0 jobsearch-JobComponent-bottomDivider",
        ];
      case "smartapply.indeed.com":
      case "m5.apply.indeed.com":
        return ["css-z7tuc2 e37uo190"];
      case "www.linkedin.com":
        return ["job-view-layout jobs-details"];
      case "www.monster.ca":
        return [
          "jobview-containerstyles__JobViewCardWrapper-sc-16af7k7-0 kdCJsu",
          "jobview-containerstyles__JobViewWrapper-sc-16af7k7-1 gfygNF",
        ];
      case "www.glassdoor.ca":
        return ["JobDetails_jobDetailsContainer__sS1W1"];
      default:
        return [];
    }
  };

  const jobPostingClass = getJobPostingClass().find(
    (postingClass) => document.getElementsByClassName(postingClass).length
  );

  if (!jobPostingClass) {
    return "";
  }

  const jobContent = document.getElementsByClassName(jobPostingClass).item(0);

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
