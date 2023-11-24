import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Dispatch, SetStateAction } from "react";
import { parseJob } from "./parse-job.util";
import { parseResume } from "./storage.util";

const GPT_COMPLETION_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const TOKEN = import.meta.env.VITE_OPENAI_API_KEY;

export async function displayCoverLetter(
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  const [tab] = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  const handleMessage = async (message: any) => {
    if (message.jobText) {
      const resume = await parseResume();
      await generateCoverLetter(message.jobText, resume, setIsLoading);
    }
  };

  chrome.runtime.onMessage.addListener(handleMessage);

  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: parseJob,
  });

  chrome.runtime.onMessage.removeListener(handleMessage);
}

async function generateCoverLetter(
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

  setIsLoading(true);
  const response = await fetch(GPT_COMPLETION_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  setIsLoading(false);

  const responseJSON = await response.json();
  const coverLetter: string = responseJSON.choices[0].message.content;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add a blank page to the document
  const page = pdfDoc.addPage();

  // Get the width and height of the page
  const { width, height } = page.getSize();
  const margin = 50;

  // Draw a string of text toward the top of the page
  const fontSize = 12;
  page.drawText(coverLetter, {
    x: margin,
    y: height - 4 * fontSize,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: width - margin * 2,
  });

  const pdfBytes = await pdfDoc.save();
  const pdfFile = new Blob([pdfBytes], { type: "application/pdf" });
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
}
