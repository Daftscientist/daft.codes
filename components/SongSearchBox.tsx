"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.daftscientist.dev";

interface SearchResult {
  track: string;
  artist: string;
  spotify_url: string;
  album_art: string;
}

interface Props {
  onSubmit: (payload: SearchResult) => Promise<void>;
  disabled: boolean;
}

export default function SongSearchBox({ onSubmit, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/spotify/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setOpen(true);
          setActiveIdx(-1);
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Click outside closes dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(async (result: SearchResult) => {
    setQuery("");
    setOpen(false);
    setResults([]);
    setActiveIdx(-1);
    await onSubmit(result);
  }, [onSubmit]);

  const handleSend = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    if (activeIdx >= 0 && results[activeIdx]) {
      await handleSelect(results[activeIdx]);
    } else {
      setQuery("");
      setOpen(false);
      setResults([]);
      setActiveIdx(-1);
      await onSubmit({ track: q, artist: "", spotify_url: "", album_art: "" });
    }
  }, [query, activeIdx, results, handleSelect, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  }, [results.length, handleSend]);

  return (
    <div ref={containerRef} className="suggest-search-wrap">
      <div className="suggest-input-row" style={{ position: "relative" }}>
        <input
          type="text"
          className="suggest-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a song..."
          autoComplete="off"
          disabled={disabled}
        />
        {loading && <span className="suggest-searching" />}
        <button
          className="suggest-send"
          disabled={disabled || !query.trim()}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
      {open && results.length > 0 && (
        <div className="suggest-dropdown">
          {results.map((r, i) => (
            <div
              key={r.spotify_url || i}
              className={`suggest-result${i === activeIdx ? " active" : ""}`}
              onMouseDown={() => handleSelect(r)}
            >
              {r.album_art && (
                <img src={r.album_art} className="suggest-result-art" alt="" />
              )}
              <div className="suggest-result-info">
                <div className="suggest-result-track">{r.track}</div>
                <div className="suggest-result-artist">{r.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
