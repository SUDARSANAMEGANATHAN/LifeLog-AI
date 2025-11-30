import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
export const QDRANT_COLLECTION = "lifelog_chunks";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

if (!OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY not set – embeddings will fail.");
}
