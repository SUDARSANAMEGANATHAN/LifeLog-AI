"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCollection = initCollection;
exports.storeMemory = storeMemory;
exports.searchMemory = searchMemory;
// backend/src/services/qdrantService.ts
const js_client_rest_1 = require("@qdrant/js-client-rest");
const dotenv_1 = __importDefault(require("dotenv"));
const embeddings_1 = require("./embeddings");
dotenv_1.default.config();
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "lifelog-ai";
let client = null;
async function initCollection() {
    var _a;
    if (!QDRANT_URL || !QDRANT_API_KEY) {
        console.log("Qdrant disabled: missing URL or API key");
        return;
    }
    try {
        client = new js_client_rest_1.QdrantClient({
            url: QDRANT_URL,
            apiKey: QDRANT_API_KEY,
        });
        const collections = await client.getCollections();
        const exists = (_a = collections.collections) === null || _a === void 0 ? void 0 : _a.some((c) => c.name === QDRANT_COLLECTION);
        if (!exists) {
            console.log("Creating Qdrant collection:", QDRANT_COLLECTION);
            await client.createCollection(QDRANT_COLLECTION, {
                vectors: {
                    size: 1536, // dimension for text-embedding-3-small
                    distance: "Cosine",
                },
            });
        }
        else {
            console.log("Qdrant collection exists:", QDRANT_COLLECTION);
        }
    }
    catch (err) {
        console.error("Qdrant disabled: skipping initCollection() due to error:", (err === null || err === void 0 ? void 0 : err.message) || err);
        client = null; // ensure we fall back later
    }
}
async function storeMemory(id, text) {
    if (!client) {
        // Qdrant not available → just skip
        return;
    }
    const vector = await (0, embeddings_1.embedText)(text);
    await client.upsert(QDRANT_COLLECTION, {
        points: [
            {
                id,
                vector,
                payload: {
                    text,
                    created_at: new Date().toISOString(),
                },
            },
        ],
    });
}
async function searchMemory(query, limit = 5) {
    if (!client) {
        // Qdrant not available → caller will use fallback
        return [];
    }
    const vector = await (0, embeddings_1.embedText)(query);
    const res = await client.search(QDRANT_COLLECTION, {
        vector,
        limit,
        with_payload: true,
    });
    return res.map((p) => {
        var _a;
        return ({
            id: p.id,
            score: p.score,
            text: ((_a = p.payload) === null || _a === void 0 ? void 0 : _a.text) || "",
        });
    });
}
