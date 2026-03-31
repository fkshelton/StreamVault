"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { searchMulti, TMDBMedia } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const doSearch = useCallback(async (q: string, p = 1, append = false) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const data = await searchMulti(q.trim(), p);
      const filtered = data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      );
      setResults((prev) => append ? [...prev, ...filtered] : filtered);
      setTotalPages(data.total_pages);
      setPage(p);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  return (
    <>
      <div className="search-hero">
        <h1 className="font-display">Find Where to Watch</h1>
        <div className="search-input-wrap" style={{ marginTop: "var(--space-lg)" }}>
          <span className="search-input-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            id="search-main-input"
            className="search-input-large"
            type="search"
            placeholder="Search movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
      </div>

      <div className="page-section" style={{ paddingTop: "var(--space-xl)" }}>
        {loading && !results.length ? (
          <div className="media-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No results found</div>
            <p>Try a different search term</p>
          </div>
        ) : results.length > 0 ? (
          <>
            {searched && (
              <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-lg)", fontSize: "0.9rem" }}>
                Showing results for <strong style={{ color: "var(--text-primary)" }}>&quot;{query}&quot;</strong>
              </p>
            )}
            <div className="media-grid animate-fade-in">
              {results.map((item) => (
                <MediaCard
                  key={`${item.id}-${item.media_type}`}
                  media={item}
                  type={(item.media_type as "movie" | "tv") || "movie"}
                  showType
                />
              ))}
            </div>
            {page < totalPages && (
              <button
                className="load-more-btn"
                onClick={() => doSearch(query, page + 1, true)}
                id="search-load-more"
              >
                Load More Results
              </button>
            )}
          </>
        ) : !searched ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <div className="empty-state-title">Search for anything</div>
            <p>Find movies and TV shows across all streaming platforms</p>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
