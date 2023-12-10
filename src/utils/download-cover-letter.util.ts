import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";
import { Dispatch, SetStateAction } from "react";
import { generateCoverLetter } from "./generate-cover-letter.util";
import { parseJobPosting } from "./parse-job-posting.util";

const FONT = "Helvetica";
const FONT_SIZE = 12;
const MARGINS = { x: 0.75, y: 1 }; // Measured in inches

export async function downloadCoverLetter(
  resume: string,
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

    const { coverLetter, name } = await generateCoverLetter(
      jobPostingText,
      resume,
      setIsLoading
    );
    downloadPdf(coverLetter, name);
    downloadDocx(coverLetter, name);
  };

  chrome.runtime.onMessage.addListener(handleJobPostingText);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: parseJobPosting,
  });
  chrome.runtime.onMessage.removeListener(handleJobPostingText);
}

async function downloadPdf(coverLetter: string, name: string) {
  const pdfFile = await convertTextToPdfBlob(coverLetter);
  const pdfFileUrl = URL.createObjectURL(pdfFile);
  downloadFile(pdfFileUrl, "pdf", name);
}

async function downloadDocx(coverLetter: string, name: string) {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: `${MARGINS.y}in`,
              right: `${MARGINS.x}in`,
              bottom: `${MARGINS.y}in`,
              left: `${MARGINS.x}in`,
            },
          },
        },
        children: coverLetter.split("\n").map(
          (paragraph) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                  size: FONT_SIZE * 2, // Font-size is measured in half-points
                  font: FONT,
                }),
              ],
            })
        ),
      },
    ],
  });

  const docxFile = await Packer.toBlob(doc);
  const docxFileUrl = URL.createObjectURL(docxFile);

  downloadFile(docxFileUrl, "docx", name);
}

function downloadFile(url: string, extension: "pdf" | "docx", name: string) {
  chrome.downloads.download(
    {
      url,
      filename: `${name} - Cover Letter.${extension}`,
    },
    () => {
      URL.revokeObjectURL(url);
    }
  );
}

async function convertTextToPdfBlob(text: string) {
  const pageWidth = 8.25;
  const textColor = "#000000";

  const doc = new jsPDF("p", "in", "a4");

  doc.setFontSize(FONT_SIZE);
  doc.setFont(FONT);
  doc.setDrawColor(textColor);

  const wrappedText = doc.splitTextToSize(text, pageWidth - MARGINS.x * 2);
  doc.text(wrappedText, MARGINS.x, MARGINS.y);

  return doc.output("blob");
}
