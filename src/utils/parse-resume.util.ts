import { parseDocx } from "./parse-docx.util";
import { parsePdf } from "./parse-pdf.util";

export async function parseResume(
  file: ArrayBuffer,
  extension: "pdf" | "docx"
) {
  switch (extension) {
    case "pdf":
      return parsePdf(file);
    case "docx":
      return parseDocx(file);
    default:
      return "";
  }
}
