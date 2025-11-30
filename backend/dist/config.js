"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_API_KEY = exports.QDRANT_COLLECTION = exports.QDRANT_URL = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 4000;
exports.QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
exports.QDRANT_COLLECTION = "lifelog_chunks";
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
if (!exports.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY not set – embeddings will fail.");
}
