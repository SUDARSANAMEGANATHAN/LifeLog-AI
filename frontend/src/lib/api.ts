// frontend/src/lib/api.ts
import axios from "axios";

// ---- Axios instance pointing to your backend ----
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// ---------- Ingest plain text ----------
export async function ingestTextApi(text: string) {
  const res = await api.post("/ingest-text", { text });
  return res.data;
}

// ---------- Upload file (PDF / image / txt) ----------
export async function uploadFileApi(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post("/upload-file", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

// ---------- Search ----------
export async function searchApi(query: string) {
  const res = await api.get("/search", {
    params: { q: query },
  });
  return res.data;
}

// ---------- Summarize ----------
export async function summarizeApi() {
  const res = await api.post("/summarize");
  return res.data;
}

export default api;
