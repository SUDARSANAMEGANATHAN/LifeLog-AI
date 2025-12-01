// frontend/src/lib/api.ts
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api",
});

// Debug: see what base URL we ended up with
if (typeof window !== "undefined") {
  console.log("LifeLog API baseURL =", api.defaults.baseURL);
}

// ---------- Ingest plain text ----------
export async function ingestTextApi(text: string) {
  try {
    const res = await api.post("/ingest-text", { text });
    return res.data;
  } catch (err) {
    const e = err as AxiosError<any>;
    console.error("ingestTextApi error:", {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data,
    });
    throw err;
  }
}

// ---------- Upload file (PDF / image / txt) ----------
export async function uploadFileApi(file: File) {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await api.post("/upload-file", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    const e = err as AxiosError<any>;
    console.error("uploadFileApi error:", {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data,
    });
    throw err;
  }
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
