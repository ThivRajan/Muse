import { parseJob } from "./parse-job.util";
import { parseResume } from "./storage.util";

const GPT_COMPLETION_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const TOKEN = import.meta.env.VITE_OPENAI_API_KEY;

export async function displayCoverLetter() {
  const [tab] = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  const handleMessage = async (message: any) => {
    if (message.jobText) {
      const resume = await parseResume();
      await generateCoverLetter(message.jobText, resume);
    }
  };

  chrome.runtime.onMessage.addListener(handleMessage);

  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: parseJob,
  });

  chrome.runtime.onMessage.removeListener(handleMessage);
}

async function generateCoverLetter(jobDescription: string, resume: string) {
  const prompt =
    `Please write a cover letter for the following job description and resume.` +
    `Here is the job description: \n\n${jobDescription}` +
    `\n\nHere is the resume: \n\n${resume}`;

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

  const responseJSON = await response.json();
  const coverLetter = responseJSON.choices[0].message.content;

  alert(coverLetter);
}
