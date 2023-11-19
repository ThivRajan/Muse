import * as pdfjs from "pdfjs-dist";
import pdfJSWorkerURL from "pdfjs-dist/build/pdf.worker?url";
import { TextItem } from "pdfjs-dist/types/src/display/api";

export async function parsePdf() {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfJSWorkerURL;
  const pdfLoading = await pdfjs.getDocument("").promise;
  const resumePage = await pdfLoading.getPage(1);
  const textContent = await resumePage.getTextContent();

  const textItems = textContent.items;
  let extractedText = "";

  for (let i = 0; i < textItems.length; i++) {
    extractedText += (textItems[i] as TextItem).str + " ";
  }

  alert(extractedText);
}
