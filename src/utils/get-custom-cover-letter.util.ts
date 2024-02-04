export async function getCustomCoverLetter(
  jobDescription: string,
  resume: string
) {
  const response = await fetch(import.meta.env.VITE_COVER_LETTER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobDescription,
      resume,
    }),
  });
  const responseJSON = await response.json();

  if (responseJSON.error) {
    throw Error(responseJSON.error);
  }

  return responseJSON.coverLetter as string;
}
