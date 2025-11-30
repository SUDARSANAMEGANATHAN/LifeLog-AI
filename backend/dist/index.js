"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const summarizeService_1 = require("./services/summarizeService");
const qdrantService_1 = require("./services/qdrantService");
const ocrService_1 = require("./services/ocrService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// -------- Helper: get userId from request header --------
function getUserIdFromReq(req) {
    // Frontend will send this in the x-user-id header
    const header = req.headers["x-user-id"];
    if (typeof header === "string" && header.trim().length > 0) {
        return header.trim();
    }
    return "guest"; // fallback user
}
// ---- Express setup ----
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const memoryStore = [];
let nextId = 1;
// ---- Qdrant init ----
(0, qdrantService_1.initCollection)().catch((err) => {
    console.error("Failed to init Qdrant:", err);
});
// ---- Ensure uploads folder exists for Multer ----
const uploadDir = path_1.default.resolve(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({
    dest: uploadDir,
});
// ---- Routes ----
// Health check
app.get("/", (_req, res) => {
    res.send("LifeLog AI backend is running!");
});
// ---------- 1) Ingest plain text from frontend ----------
app.post("/api/ingest-text", async (req, res) => {
    const { text } = req.body;
    const userId = getUserIdFromReq(req);
    if (!text || typeof text !== "string") {
        return res.status(400).json({ ok: false, error: "text is required" });
    }
    const id = nextId++;
    try {
        // keep local copy for simple per-user fallback search
        memoryStore.push({ id, userId, text });
        // store in Qdrant (semantic memory – currently not user-aware)
        await (0, qdrantService_1.storeMemory)(id, text);
        return res.json({ ok: true, id });
    }
    catch (err) {
        console.error("ingest-text error:", err);
        return res
            .status(500)
            .json({ ok: false, error: "failed to store in memory" });
    }
});
// ---------- 2) Upload + extract text from a file (PDF/TXT/IMAGE) ----------
app.post("/api/upload-file", upload.single("file"), async (req, res) => {
    const userId = getUserIdFromReq(req);
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, error: "No file uploaded" });
        }
        const filePath = req.file.path;
        const ext = path_1.default.extname(req.file.originalname).toLowerCase();
        let extractedText = "";
        try {
            // Format detection + extraction (PDF / TXT / IMAGE OCR)
            if (ext === ".pdf") {
                // PDF → text
                const dataBuffer = fs_1.default.readFileSync(filePath);
                const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
                extractedText = pdfData.text || "";
            }
            else if (ext === ".txt" || ext === ".md") {
                // Plain text
                extractedText = fs_1.default.readFileSync(filePath, "utf8");
            }
            else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
                // Image → OCR
                extractedText = await (0, ocrService_1.ocrImage)(filePath);
            }
            else {
                // Unsupported type – still store something so demo works
                extractedText = `File uploaded: ${req.file.originalname}`;
            }
        }
        catch (innerErr) {
            // If parsing fails, still keep a fallback text
            console.error("Inner parse error in upload-file:", innerErr);
            extractedText = `File uploaded (could not fully parse): ${req.file.originalname}`;
        }
        extractedText = (extractedText || "").trim();
        if (!extractedText) {
            extractedText = `File uploaded (no text extracted): ${req.file.originalname}`;
        }
        const id = nextId++;
        // store in local memory (per user)
        memoryStore.push({ id, userId, text: extractedText });
        // ALSO store in Qdrant for semantic search
        await (0, qdrantService_1.storeMemory)(id, extractedText);
        console.log("Uploaded file stored id", id, "user", userId, req.file.originalname, "preview:", extractedText.slice(0, 80) + "...");
        return res.json({
            ok: true,
            id,
            fileName: req.file.originalname,
            text: extractedText, // frontend uses data.text
        });
    }
    catch (err) {
        console.error("upload-file error (outer):", err);
        return res.status(500).json({ ok: false, error: "upload failed" });
    }
    finally {
        // remove temp file
        if (req.file) {
            fs_1.default.unlink(req.file.path, () => { });
        }
    }
});
// ---------- 3) Semantic search (Qdrant + per-user fallback) ----------
app.get("/api/search", async (req, res) => {
    const q = req.query.q || "";
    const userId = getUserIdFromReq(req);
    if (!q) {
        return res.status(400).json({ ok: false, error: "q is required" });
    }
    try {
        // Try semantic search in Qdrant (currently global, not user-scoped)
        const vectorResults = await (0, qdrantService_1.searchMemory)(q, 8);
        // Per-user fallback using local memory
        let fallback = [];
        if (!vectorResults || vectorResults.length === 0) {
            const query = q.toLowerCase();
            fallback = memoryStore.filter((item) => item.userId === userId && item.text.toLowerCase().includes(query));
        }
        return res.json({
            ok: true,
            query: q,
            results: vectorResults && vectorResults.length
                ? vectorResults
                : fallback.map((m) => ({ id: m.id, text: m.text, score: null })),
        });
    }
    catch (err) {
        console.error("search error:", err);
        return res.status(500).json({ ok: false, error: "search failed" });
    }
});
// ---------- 4) Summarize notes (per user) ----------
app.post("/api/summarize", async (req, res) => {
    const userId = getUserIdFromReq(req);
    try {
        const allTexts = memoryStore
            .filter((m) => m.userId === userId)
            .map((m) => m.text);
        const summary = await (0, summarizeService_1.summarizeNotes)(allTexts);
        return res.json({ ok: true, summary });
    }
    catch (err) {
        console.error("summarize error:", err);
        return res.status(500).json({ ok: false, error: "Failed to summarize" });
    }
});
// ---- Start server ----
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
