import { Dispatch, SetStateAction } from "react";

const DATE_TOKEN = "[Date]";

export async function generateCoverLetter(
  jobDescription: string,
  resume: string,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
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
      messages: [{ role: "user", content: getPrompt(jobDescription, resume) }],
      temperature: 0.5,
    }),
  });
  setIsLoading(false);

  const responseJSON = await response.json();
  const coverLetter: string = responseJSON.choices[0].message.content;
  const name = coverLetter.split("\n")[0];
  return {
    coverLetter: formatCoverLetter(coverLetter, resume),
    name,
  };
}

function getPrompt(jobDescription: string, resume: string) {
  const headerItems = ["name", "my location", "email", "phone number"].join(
    ", "
  );
  const wordCount = "200";

  const contentPrompt =
    `Please craft a cover letter within ${wordCount} words using the provided and job description. ` +
    `Ensure the cover letter relates the resume's experience ` +
    `to demonstrate how it aligns with the job description, showcasing value.`;

  const formattingPrompt =
    `Include ONLY the following details at the top of the cover letter in this EXACT order, each on a separate line:` +
    `${headerItems}, and ${DATE_TOKEN}. Do NOT include any of the company's information before the letter.`;

  return (
    `I am going to send you my resume along with a job description. ` +
    `However, the job description is part of a larger block of text I'm going to send you. ` +
    `Please extract the job description from this block and use that: \n\n${jobDescription}` +
    `\n\nHere is the resume: \n\n${resume}` +
    `\n\n${contentPrompt} ${formattingPrompt}`
  );
}

function getFormattedDate() {
  return (
    "\n" +
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date())
  );
}

function formatCoverLetter(coverLetter: string, resume: string) {
  const dateFormattedLetter = coverLetter.replace(
    DATE_TOKEN,
    getFormattedDate()
  );

  const emailMatch = getEmailMatch(coverLetter);
  const email = emailMatch?.[0];

  const patternsToRemove = [
    /\n\(123\) 456-7890/g,
    /\n123-456-7890/g,
    /\n(\[)?Phone Number(\])?/g,
    /\nPhone: 123-456-7890/g,
    ...(isFakeEmail(resume, email) ? [new RegExp(email || "", "g")] : []),
  ];
  return patternsToRemove.reduce(
    (acc, pattern) => acc.replace(pattern, ""),
    dateFormattedLetter
  );
}

function isFakeEmail(resume: string, email?: string) {
  return email && !resume.includes(email);
}

function getEmailMatch(coverLetter: string) {
  const emailPattern = /\n\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return emailPattern.exec(coverLetter);
}
