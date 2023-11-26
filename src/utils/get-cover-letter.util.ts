import { Dispatch, SetStateAction } from "react";

export async function getCoverLetter(
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
    }),
  });
  setIsLoading(false);

  const responseJSON = await response.json();
  const coverLetter: string = responseJSON.choices[0].message.content;
  return coverLetter;
}

function getPrompt(jobDescription: string, resume: string) {
  return (
    `Please write a cover letter for the following job description and resume. ` +
    `At the top of the cover letter, ` +
    `add my phone number, name and email (you should have it from my resume) and today's date.` +
    `Here is the job description: \n\n${jobDescription}` +
    `\n\nHere is the resume: \n\n${resume}` +
    `Please keep it within 250 words.`
  );
}
