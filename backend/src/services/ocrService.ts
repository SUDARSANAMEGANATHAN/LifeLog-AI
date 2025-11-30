// backend/src/services/ocrService.ts
import Tesseract from "tesseract.js";

export async function ocrImage(filePath: string): Promise<string> {
  const result = await Tesseract.recognize(filePath, "eng", {
    logger: (m) => {
      // you can log progress if you want:
      // console.log(m);
    },
  });

  return result.data.text || "";
}
