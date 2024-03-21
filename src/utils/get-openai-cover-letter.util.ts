export async function getOpenAICoverLetter(
  jobDescription: string,
  resume: string
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: getPrompt(jobDescription, resume) }],
      temperature: 0.4,
    }),
  });
  const responseJSON = await response.json();
  return responseJSON.choices[0].message.content as string;
}

function getPrompt(jobDescription: string, resume: string) {
  const headerItems = ["name", "my location", "email", "phone number"].join(
    ", "
  );
  const wordCount = "250";
  const DATE_TOKEN = "[Date]";

  const contentPrompt =
    `Craft a compelling cover letter that accurately highlights ` +
    `my experience and achievements based on the provided resume and job description. ` +
    `Keep it within ${wordCount} words. PLEASE be truthful with respect to my resume, when you describe my responsibitilies in the cover letter.`;

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
