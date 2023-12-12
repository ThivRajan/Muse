import { extractRawText } from "mammoth";

export async function parseDocx(docxFile: ArrayBuffer) {
  const result = await extractRawText({ arrayBuffer: docxFile });
  return result.value;
}
