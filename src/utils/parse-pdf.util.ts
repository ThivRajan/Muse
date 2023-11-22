import * as pdfjs from "pdfjs-dist";
import pdfJSWorkerURL from "pdfjs-dist/build/pdf.worker?url";
import { TextItem } from "pdfjs-dist/types/src/display/api";

export async function parsePdf(file: ArrayBuffer) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfJSWorkerURL;
  const pdfLoading = await pdfjs.getDocument(file).promise;
  const resumePage = await pdfLoading.getPage(1);
  const textContent = await resumePage.getTextContent();

  const textItems = textContent.items;
  const extractedText = textItems.reduce(
    (acc: string, curr) => acc + (curr as TextItem).str + " ",
    ""
  );

  alert(extractedText);
}
