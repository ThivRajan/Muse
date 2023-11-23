const GPT_COMPLETION_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const TOKEN = import.meta.env.VITE_OPENAI_TOKEN;

async function generateCoverLetter(jobDescription: string, resume: string) {
  console.log("generating cover letter");
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
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const responseJSON = await response.json();
  const coverLetter = responseJSON.choices[0].message.content;

  alert(coverLetter);
}
