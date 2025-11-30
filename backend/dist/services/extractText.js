"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkText = chunkText;
const MAX_CHUNK_LENGTH = 700; // characters
function chunkText(text) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks = [];
    let current = "";
    for (const sentence of sentences) {
        if ((current + " " + sentence).length > MAX_CHUNK_LENGTH) {
            if (current.trim().length > 0)
                chunks.push(current.trim());
            current = sentence;
        }
        else {
            current += " " + sentence;
        }
    }
    if (current.trim().length > 0)
        chunks.push(current.trim());
    return chunks;
}
