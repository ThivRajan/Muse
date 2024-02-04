import { Dispatch, SetStateAction } from "react";
import { formatCoverLetter } from "./format-cover-letter.util";
import { getCustomCoverLetter } from "./get-custom-cover-letter.util";
import { getOpenAICoverLetter } from "./get-openai-cover-letter.util";

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
    const coverLetter = await (import.meta.env.USE_CUSTOM_COVER_LETTER
      ? getCustomCoverLetter(jobDescription, resume)
      : getOpenAICoverLetter(jobDescription, resume));
    setIsLoading(false);

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
