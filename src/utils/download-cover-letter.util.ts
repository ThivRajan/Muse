import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
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
  downloadFile(pdfFile, "pdf", name);
}

async function downloadDocx(coverLetter: string, name: string) {
  const docxFile = await convertTextToDocxBlob(coverLetter);
  downloadFile(docxFile, "docx", name);
}

function downloadFile(fileBlob: Blob, extension: "pdf" | "docx", name: string) {
  const fileUrl = URL.createObjectURL(fileBlob);
  chrome.downloads.download(
    {
      url: fileUrl,
      filename: `${name} - Cover Letter.${extension}`,
    },
    () => {
      URL.revokeObjectURL(fileUrl);
    }
  );
}

async function convertTextToPdfBlob(text: string) {
  const pageWidth = 8.25;
  const textColor = "#000000";

  const doc = new jsPDF("p", "in", "a4");
  const [name, ...body] = text.split("\n");
  doc.setDrawColor(textColor);
  doc.setFontSize(FONT_SIZE);

  const wrappedBody = doc.splitTextToSize(
    `\n\n${body.join("\n")}`,
    pageWidth - MARGINS.x * 2
  );

  doc
    .setFont(FONT, "bold")
    .setFontSize(FONT_SIZE * 2)
    .text(name, MARGINS.x, MARGINS.y);
  doc
    .setFont(FONT, "normal")
    .setFontSize(FONT_SIZE)
    .text(wrappedBody, MARGINS.x, MARGINS.y);

  return doc.output("blob");
}

async function convertTextToDocxBlob(text: string) {
  const [name, ...body] = text.split("\n");

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: HeadingLevel.HEADING_1,
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            bold: true,
            size: FONT_SIZE * 4,
            font: FONT,
          },
        },
      ],
    },
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
        children: [
          new Paragraph({
            text: name,
            heading: HeadingLevel.HEADING_1,
          }),
        ].concat(
          ["\n", ...body].map(
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
          )
        ),
      },
    ],
  });

  return await Packer.toBlob(doc);
}
