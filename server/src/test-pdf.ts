import { extractPdfText } from "./services/pdf.service.js";

const filePath =
  "C:\\Users\\sanch\\Downloads\\FullStackInternResume.pdf";

console.log("TEST FILE STARTED");
console.log("ABOUT TO EXTRACT");

try {
  const result = await extractPdfText(filePath);

  console.log("EXTRACTION SUCCESS");
  console.log("PAGE COUNT:", result.pageCount);
  console.log("NUMBER OF EXTRACTED PAGES:", result.pages.length);

  for (const page of result.pages) {
    console.log(`\n--- PAGE ${page.pageNumber} ---`);
    console.log("TEXT LENGTH:", page.text.length);
    console.log(page.text.slice(0, 500));
  }
} catch (error) {
  console.error("EXTRACTION FAILED:");
  console.error(error);
}