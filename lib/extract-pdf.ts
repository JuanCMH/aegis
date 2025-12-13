import { extractText } from "unpdf";

export async function getPdfContent(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  const { text } = await extractText(arrayBuffer);

  return text;
}
