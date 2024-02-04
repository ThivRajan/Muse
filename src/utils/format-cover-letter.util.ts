const DATE_TOKEN = "[Date]";

export function formatCoverLetter(coverLetter: string, resume: string) {
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
