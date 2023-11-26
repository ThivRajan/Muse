import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Dispatch, SetStateAction } from "react";
import { generateCoverLetter } from "./generate-cover-letter.util";
import { parseJobPosting } from "./parse-job-posting.util";
import { getResumeFromStorage } from "./resume-storage.util";

export async function downloadCoverLetter(
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  const [tab] = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  const handleJobPostingText = async ({
    jobPostingText,
  }: {
    jobPostingText: string;
  }) => {
    if (!jobPostingText) return;

    const resume = await getResumeFromStorage();
    const coverLetter = await generateCoverLetter(
      jobPostingText,
      resume,
      setIsLoading
    );
    const pdfFile = await convertTextToPdfBlob(coverLetter);
    const pdfFileUrl = URL.createObjectURL(pdfFile);

    chrome.downloads.download(
      {
        url: pdfFileUrl,
        filename: "Muses Cover Letter.pdf",
      },
      () => {
        URL.revokeObjectURL(pdfFileUrl);
      }
    );
  };

  chrome.runtime.onMessage.addListener(handleJobPostingText);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: parseJobPosting,
  });
  chrome.runtime.onMessage.removeListener(handleJobPostingText);
}

async function convertTextToPdfBlob(text: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  const fontSize = 12;
  page.drawText(text, {
    x: margin,
    y: height - 4 * fontSize,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: width - margin * 2,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
