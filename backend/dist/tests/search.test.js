"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const embeddings_1 = require("../services/embeddings");
test("embedText returns a vector", async () => {
    const v = await (0, embeddings_1.embedText)("hello world");
    expect(Array.isArray(v)).toBe(true);
    expect(v.length).toBeGreaterThan(100);
});
