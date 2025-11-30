"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const ocrService_1 = require("../services/ocrService");
const extractText_1 = require("../services/extractText");
const embeddings_1 = require("../services/embeddings");
const qdrantService_1 = require("../services/qdrantService");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
// For hackathon assume single demo user:
const DEMO_USER_ID = "demo-user";
router.post("/file", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        let extractedText = "";
        if (file.mimetype.includes("pdf")) {
            extractedText = await (0, ocrService_1.extractTextFromPdf)(file.path);
        }
        else if (file.mimetype.startsWith("image/")) {
            extractedText = await (0, ocrService_1.extractTextFromImage)(file.path);
        }
        else {
            return res.status(400).json({ error: "Unsupported file type" });
        }
        const textChunks = (0, extractText_1.chunkText)(extractedText);
        for (const text of textChunks) {
            const chunk = {
                id: (0, uuid_1.v4)(),
                text,
                metadata: {
                    id: (0, uuid_1.v4)(),
                    userId: DEMO_USER_ID,
                    sourceType: file.mimetype.includes("pdf") ? "pdf" : "image",
                    fileName: file.originalname,
                    createdAt: new Date().toISOString(),
                },
            };
            const vector = await (0, embeddings_1.embedText)(text);
            await (0, qdrantService_1.upsertChunk)(chunk, vector);
        }
        res.json({ message: "File ingested", chunks: textChunks.length });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to ingest file" });
    }
});
router.post("/text", async (req, res) => {
    try {
        const { text, tags } = req.body;
        const textChunks = (0, extractText_1.chunkText)(text);
        for (const t of textChunks) {
            const chunk = {
                id: (0, uuid_1.v4)(),
                text: t,
                metadata: {
                    id: (0, uuid_1.v4)(),
                    userId: DEMO_USER_ID,
                    sourceType: "text",
                    createdAt: new Date().toISOString(),
                    tags,
                },
            };
            const vector = await (0, embeddings_1.embedText)(t);
            await (0, qdrantService_1.upsertChunk)(chunk, vector);
        }
        res.json({ message: "Text ingested", chunks: textChunks.length });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to ingest text" });
    }
});
exports.default = router;
