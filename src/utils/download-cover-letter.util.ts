import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Dispatch, SetStateAction } from "react";
import { parseJobPosting } from "./parse-job-posting.util";
import { parseResume } from "./storage.util";

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

    const resume = await parseResume();
    const coverLetter = await getCoverLetter(
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

async function getCoverLetter(
  jobDescription: string,
  resume: string,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  const prompt =
    `Please write a cover letter for the following job description and resume. ` +
    `At the top of the cover letter, ` +
    `add my phone number, name and email (you should have it from my resume) and today's date.` +
    `Here is the job description: \n\n${jobDescription}` +
    `\n\nHere is the resume: \n\n${resume}` +
    `Please keep it within 250 words.`;
  const GPT_COMPLETION_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  setIsLoading(true);
  const response = await fetch(GPT_COMPLETION_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  setIsLoading(false);

  const responseJSON = await response.json();
  const coverLetter: string = responseJSON.choices[0].message.content;
  return coverLetter;
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
