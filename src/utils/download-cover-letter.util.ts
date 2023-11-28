import { Document, Packer, Paragraph, TextRun } from "docx";
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

    const doc = new Document({
      sections: [
        {
          children: coverLetter.split("\n").map(
            (paragraph) =>
              new Paragraph({
                children: [new TextRun({ text: paragraph, font: "Helvetica" })],
              })
          ),
        },
      ],
    });

    const docxFile = await Packer.toBlob(doc);
    const docxFileUrl = URL.createObjectURL(docxFile);

    downloadFile(pdfFileUrl, "pdf");
    downloadFile(docxFileUrl, "docx");
  };

  chrome.runtime.onMessage.addListener(handleJobPostingText);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: parseJobPosting,
  });
  chrome.runtime.onMessage.removeListener(handleJobPostingText);
}

function downloadFile(url: string, extension: "pdf" | "docx") {
  chrome.downloads.download(
    {
      url,
      filename: `Muses Cover Letter.${extension}`,
    },
    () => {
      URL.revokeObjectURL(url);
    }
  );
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
