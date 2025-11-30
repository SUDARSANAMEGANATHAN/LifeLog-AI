import { Router } from "express";
import { embedText } from "../services/embeddings.ts";
import { searchChunks } from "../services/qdrantService.ts";

const router = Router();
const DEMO_USER_ID = "demo-user";

router.get("/", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    const limit = Number(req.query.limit || 10);

    if (!query) return res.status(400).json({ error: "Query is required" });

    const queryVector = await embedText(query);
    const results = await searchChunks(DEMO_USER_ID, queryVector, limit);

    res.json({ query, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
