"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrImage = ocrImage;
// backend/src/services/ocrService.ts
const tesseract_js_1 = __importDefault(require("tesseract.js"));
async function ocrImage(filePath) {
    const result = await tesseract_js_1.default.recognize(filePath, "eng", {
        logger: (m) => {
            // you can log progress if you want:
            // console.log(m);
        },
    });
    return result.data.text || "";
}
