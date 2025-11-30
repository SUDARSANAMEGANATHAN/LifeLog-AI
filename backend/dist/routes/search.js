"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const embeddings_ts_1 = require("../services/embeddings.ts");
const qdrantService_ts_1 = require("../services/qdrantService.ts");
const router = (0, express_1.Router)();
const DEMO_USER_ID = "demo-user";
router.get("/", async (req, res) => {
    try {
        const query = req.query.q || "";
        const limit = Number(req.query.limit || 10);
        if (!query)
            return res.status(400).json({ error: "Query is required" });
        const queryVector = await (0, embeddings_ts_1.embedText)(query);
        const results = await (0, qdrantService_ts_1.searchChunks)(DEMO_USER_ID, queryVector, limit);
        res.json({ query, results });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Search failed" });
    }
});
exports.default = router;
