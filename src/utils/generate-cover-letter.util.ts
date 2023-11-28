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
  const coverLetter: string = responseJSON.choices[0].message.content.replace(
    DATE_TOKEN,
    getFormattedDate()
  );
  return coverLetter;
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
    `${headerItems}, and ${DATE_TOKEN}.`;

  return (
    `I am going to send you my resume along with a job description. ` +
    `Here is the job description: \n\n${jobDescription}` +
    `\n\nHere is the resume: \n\n${resume}` +
    `\n\n${contentPrompt} ${formattingPrompt}`
  );
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}
