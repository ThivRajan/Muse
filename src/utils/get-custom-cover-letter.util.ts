export async function getCustomCoverLetter(
  jobDescription: string,
  resume: string
) {
  const response = await fetch(
    import.meta.env.VITE_CUSTOM_COVER_LETTER_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobDescription,
        resume,
      }),
    }
  );
  const responseJSON = await response.json();

  if (responseJSON.error) {
    throw Error(responseJSON.error);
  }

  return responseJSON.coverLetter as string;
}
