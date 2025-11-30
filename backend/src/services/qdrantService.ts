// backend/src/services/qdrantService.ts
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import { embedText } from "./embeddings";

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "lifelog-ai";

let client: QdrantClient | null = null;

export async function initCollection() {
  if (!QDRANT_URL || !QDRANT_API_KEY) {
    console.log("Qdrant disabled: missing URL or API key");
    return;
  }

  try {
    client = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
    });

    const collections = await client.getCollections();

    const exists = collections.collections?.some(
      (c) => c.name === QDRANT_COLLECTION
    );

    if (!exists) {
      console.log("Creating Qdrant collection:", QDRANT_COLLECTION);
      await client.createCollection(QDRANT_COLLECTION, {
        vectors: {
          size: 1536, // dimension for text-embedding-3-small
          distance: "Cosine",
        },
      });
    } else {
      console.log("Qdrant collection exists:", QDRANT_COLLECTION);
    }
  } catch (err: any) {
    console.error(
      "Qdrant disabled: skipping initCollection() due to error:",
      err?.message || err
    );
    client = null; // ensure we fall back later
  }
}

export async function storeMemory(id: number, text: string) {
  if (!client) {
    // Qdrant not available → just skip
    return;
  }

  const vector = await embedText(text);

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

export async function searchMemory(query: string, limit = 5) {
  if (!client) {
    // Qdrant not available → caller will use fallback
    return [];
  }

  const vector = await embedText(query);

  const res = await client.search(QDRANT_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return res.map((p) => ({
    id: p.id,
    score: p.score,
    text: (p.payload as any)?.text || "",
  }));
}
