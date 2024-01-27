import { Dispatch, SetStateAction } from "react";

const DATE_TOKEN = "[Date]";

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

  const email = getEmailMatch(coverLetter)?.[0];
  const number = getNumberMatch(coverLetter)?.[0];

  const patternsToRemove = [
    /\n(\[)?Phone Number(\])?/g,
    /\nPhone: /g,
    /\n(\[)?Email(\])?/g,
    /\nEmail: /g,
    ...insertPatternIfFake(resume, email),
    ...insertPatternIfFake(resume, number),
  ];
  return patternsToRemove.reduce(
    (acc, pattern) => acc.replace(pattern, ""),
    dateFormattedLetter
  );
}

function insertPatternIfFake(resume: string, contact?: string) {
  return contact && !resume.includes(contact.replace("\n", ""))
    ? [new RegExp(contact || "", "g")]
    : [];
}

function getEmailMatch(coverLetter: string) {
  const emailPattern = /\n\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return emailPattern.exec(coverLetter);
}

function getNumberMatch(coverLetter: string) {
  const numberPattern =
    /\n?\b(?:\+\d{1,2}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  return numberPattern.exec(coverLetter);
}
