import * as pdfjs from "pdfjs-dist";
import pdfJSWorkerURL from "pdfjs-dist/build/pdf.worker?url";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import sampleResume from "../assets/Sample Resume.pdf";

export async function parsePdf() {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfJSWorkerURL;
  const pdfLoading = await pdfjs.getDocument(sampleResume).promise;
  const resumePage = await pdfLoading.getPage(1);
  const textContent = await resumePage.getTextContent();

  const textItems = textContent.items;
  const extractedText = textItems.reduce(
    (acc: string, curr) => acc + (curr as TextItem).str + " ",
    ""
  );

  alert(extractedText);
}
