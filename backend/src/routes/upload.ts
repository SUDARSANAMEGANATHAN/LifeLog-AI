import { Router } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import {
  extractTextFromImage,
  extractTextFromPdf,
} from "../services/ocrService";
import { chunkText } from "../services/extractText";
import { embedText } from "../services/embeddings";
import { upsertChunk } from "../services/qdrantService";
import { Chunk } from "../types";

const router = Router();
const upload = multer({ dest: "uploads/" });

// For hackathon assume single demo user:
const DEMO_USER_ID = "demo-user";

router.post("/file", upload.single("file"), async (req, res) => {
  try {
    const file = req.file!;
    let extractedText = "";

    if (file.mimetype.includes("pdf")) {
      extractedText = await extractTextFromPdf(file.path);
    } else if (file.mimetype.startsWith("image/")) {
      extractedText = await extractTextFromImage(file.path);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const textChunks = chunkText(extractedText);

    for (const text of textChunks) {
      const chunk: Chunk = {
        id: uuid(),
        text,
        metadata: {
          id: uuid(),
          userId: DEMO_USER_ID,
          sourceType: file.mimetype.includes("pdf") ? "pdf" : "image",
          fileName: file.originalname,
          createdAt: new Date().toISOString(),
        },
      };

      const vector = await embedText(text);
      await upsertChunk(chunk, vector);
    }

    res.json({ message: "File ingested", chunks: textChunks.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to ingest file" });
  }
});

router.post("/text", async (req, res) => {
  try {
    const { text, tags } = req.body;
    const textChunks = chunkText(text);

    for (const t of textChunks) {
      const chunk: Chunk = {
        id: uuid(),
        text: t,
        metadata: {
          id: uuid(),
          userId: DEMO_USER_ID,
          sourceType: "text",
          createdAt: new Date().toISOString(),
          tags,
        },
      };
      const vector = await embedText(t);
      await upsertChunk(chunk, vector);
    }

    res.json({ message: "Text ingested", chunks: textChunks.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to ingest text" });
  }
});

export default router;
