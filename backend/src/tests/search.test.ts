import { embedText } from "../services/embeddings";

test("embedText returns a vector", async () => {
  const v = await embedText("hello world");
  expect(Array.isArray(v)).toBe(true);
  expect(v.length).toBeGreaterThan(100);
});
