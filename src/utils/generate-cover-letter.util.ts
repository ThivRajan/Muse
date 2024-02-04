import { Dispatch, SetStateAction } from "react";
import { formatCoverLetter } from "./format-cover-letter.util";

export async function generateCoverLetter(
  jobDescription: string,
  resume: string,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<{
  coverLetter: string;
  name: string;
  error?: any;
}> {
  setIsLoading(true);
  try {
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
    setIsLoading(false);
    const responseJSON = await response.json();

    if (responseJSON.error) {
      return { coverLetter: "", name: "", error: responseJSON.error };
    }

    const coverLetter = responseJSON.coverLetter as string;
    const name = coverLetter.split("\n")[0];
    return {
      coverLetter: formatCoverLetter(coverLetter, resume),
      name,
    };
  } catch (error) {
    setIsLoading(false);
    return {
      coverLetter: "",
      name: "",
      error: "Unable to generate cover letter",
    };
  }
}
