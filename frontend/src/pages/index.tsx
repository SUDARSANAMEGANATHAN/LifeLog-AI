// frontend/src/pages/index.tsx
import { useEffect, useState } from "react";
import UploadPanel from "../components/UploadPanel";
import { searchApi, summarizeApi } from "../lib/api";

interface SearchResult {
  id: number;
  text: string;
  score: number | null;
  fileName?: string;
  sourceType?: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // simple “profile name” stored in localStorage
  const [userName, setUserName] = useState("");
  const [tempName, setTempName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedName =
      typeof window !== "undefined"
        ? window.localStorage.getItem("lifelog-user-name") || ""
        : "";
    if (storedName) {
      setUserName(storedName);
      setTempName(storedName);
    }
  }, []);

  function handleSaveName() {
    const name = tempName.trim() || "Guest";
    setUserName(name);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lifelog-user-name", name);
    }
    setProfileOpen(false);
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchApi(query);
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Search failed. Check backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
    setSummaryLoading(true);
    try {
      const data = await summarizeApi();
      setSummary(data.summary || "No summary available yet.");
    } catch (err) {
      console.error(err);
      alert("Failed to summarize your LifeLog.");
    } finally {
      setSummaryLoading(false);
    }
  }

  // When new text/file is ingested, re-run search if there’s a query
  async function handleIngested() {
    if (query.trim()) {
      await handleSearch();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* MAIN CARD – medium height, scrolls inside if content is long */}
      <div className="w-full max-w-4xl bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-white backdrop-blur-md max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-5 space-y-5">
          {/* HEADER */}
          <header className="flex items-center justify-between">
            {/* Left: Logo + brand */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/lifelog-logo.png"
                  alt="LifeLog AI Logo"
                  className="h-12 w-12 object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
                  LifeLog <span className="text-sky-300">AI</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-200/80">
                  Your entire life, searchable.
                </p>
              </div>
            </div>

            {/* Right: User profile bubble */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-md hover:bg-white transition"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">
                    User
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {userName || "Guest"}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {/* simple hamburger icon */}
                  <div className="space-y-[3px]">
                    <span className="block h-[2px] w-4 bg-white rounded" />
                    <span className="block h-[2px] w-3 bg-white/80 rounded" />
                    <span className="block h-[2px] w-5 bg-white rounded" />
                  </div>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/95 shadow-lg border border-slate-200 p-3 space-y-2 text-sm z-20">
                  <p className="font-semibold text-slate-900 mb-1">
                    User Profile
                  </p>
                  <label className="text-xs text-slate-600">Display name</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="w-full mt-1 rounded-lg bg-sky-500 text-white text-sm py-1.5 hover:bg-sky-600 transition"
                  >
                    Save
                  </button>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-2">
                    Your notes and files are stored under your user ID in the
                    backend.
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* DAILY SNAPSHOT */}
          <section className="rounded-2xl bg-slate-950/80 border border-slate-700 px-4 py-3 text-sm text-slate-100 max-h-40 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-sky-300">
                Daily Snapshot
              </h2>
              <span className="text-[11px] text-slate-400">
                {summary
                  ? "AI summary of your LifeLog"
                  : "Click “Summarize my LifeLog” below to generate"}
              </span>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-xs md:text-sm">
              {summary
                ? summary
                : "No summary yet. Upload some notes or files, then hit “Summarize my LifeLog” to get a quick overview of your recent memories."}
            </p>
          </section>

          {/* SEARCH BAR + RESULTS */}
          <main className="rounded-2xl bg-slate-950/85 border border-slate-700 p-4 md:p-5 flex flex-col gap-4">
            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-3 items-stretch"
            >
              <div className="flex-1 flex items-center rounded-full bg-slate-800/80 px-4 py-2 shadow-inner border border-slate-700">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search your life… e.g. "all internship notes"'
                  className="flex-1 bg-transparent border-none outline-none text-sm md:text-base text-slate-50 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="md:w-28 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-5 py-2 shadow-md flex items-center justify-center disabled:opacity-60 disabled:hover:bg-sky-500"
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </form>

            {/* Search results */}
            <div className="mt-1 max-h-40 overflow-y-auto space-y-3 text-sm">
              {results.length === 0 && !loading && (
                <p className="text-xs md:text-sm text-slate-400">
                  No results yet. Upload something or ask a question above.
                </p>
              )}

              {results.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-50 text-xs md:text-sm"
                >
                  <p className="whitespace-pre-wrap">{r.text}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {r.fileName && <span>📄 {r.fileName}</span>}
                    {r.sourceType && <span>• {r.sourceType}</span>}
                    {typeof r.score === "number" && (
                      <span>• score: {r.score.toFixed(3)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* ADD TO LIFELOG + BOTTOM BUTTONS */}
          <section className="rounded-2xl bg-slate-950/85 border border-slate-700 p-4 md:p-5 flex flex-col gap-4 mb-2">
            {/* Upload panel – “Add to your LifeLog” */}
            <UploadPanel onIngest={handleIngested} />

            {/* Bottom row buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-2">
              <button
                type="button"
                onClick={handleSummarize}
                disabled={summaryLoading}
                className="w-full md:w-auto rounded-full bg-white/95 text-slate-900 text-sm font-medium px-6 py-2 shadow-md flex items-center justify-center gap-2 hover:bg-white disabled:opacity-60"
              >
                <span className="text-lg">😊</span>
                <span>
                  {summaryLoading ? "Summarizing…" : "Summarize my LifeLog"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSummarize}
                disabled={summaryLoading}
                className="w-full md:w-auto rounded-full bg-rose-500/90 text-white text-sm font-medium px-6 py-2 shadow-md flex items-center justify-center gap-2 hover:bg-rose-600 disabled:opacity-60"
              >
                <span className="text-lg">❤️</span>
                <span>Daily Snapshot</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
