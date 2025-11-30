"use client";

import React, { useState } from "react";
import { ingestTextApi, uploadFileApi } from "../lib/api";

export default function UploadPanel({ onIngest }: { onIngest?: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleTextIngest() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await ingestTextApi(text);
      alert("Text sent to backend and stored in memory!");
      setText("");
      onIngest && onIngest();
    } catch (err) {
      console.error(err);
      alert("Failed to send text to backend");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const data = await uploadFileApi(file);
      alert("File processed! Extracted text:\n\n" + (data.text || ""));
      setFile(null);
      onIngest && onIngest();
    } catch (err) {
      console.error(err);
      alert("File upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-100">
        Add to your LifeLog
      </h2>

      {/* File section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-xs text-slate-200"
        />
        <button
          onClick={handleFileUpload}
          disabled={!file || loading}
          className="rounded-full bg-emerald-500 text-white text-xs font-medium px-4 py-1.5 shadow hover:bg-emerald-600 disabled:opacity-60"
        >
          Upload File
        </button>
      </div>

      {/* Text section */}
      <div className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text, chat exports, notes..."
          rows={3}
          className="w-full rounded-2xl bg-slate-800/80 border border-slate-700 text-xs md:text-sm text-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button
          onClick={handleTextIngest}
          disabled={loading || !text.trim()}
          className="self-start rounded-full bg-sky-500 text-white text-xs font-medium px-4 py-1.5 shadow hover:bg-sky-600 disabled:opacity-60"
        >
          {loading ? "Ingesting…" : "Ingest Text"}
        </button>
      </div>
    </div>
  );
}
