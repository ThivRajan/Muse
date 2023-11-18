export function displayJob() {
  const getJobPostingClass = () => {
    return "fastviewjob jobsearch-ViewJobLayout--embedded css-1lo7kga eu4oa1w0";
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

  const jobText = jobContent ? getTextContent(jobContent as HTMLElement) : "";

  alert(jobText);
}
