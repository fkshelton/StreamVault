"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  discoverMovies, discoverTV, getPosterUrl, getDisplayTitle, getDisplayYear,
  formatRating, STREAMING_PROVIDERS, TMDBMedia,
} from "@/lib/tmdb";

const MOODS = [
  { label: "🎬 Any", genres: "" },
  { label: "😂 Funny", genres: "35" },
  { label: "😱 Scary", genres: "27" },
  { label: "💥 Action", genres: "28" },
  { label: "💕 Romantic", genres: "10749" },
  { label: "🧠 Mind-Bending", genres: "878,9648" },
  { label: "🎭 Drama", genres: "18" },
  { label: "👨‍👩‍👧‍👦 Family", genres: "10751,16" },
  { label: "🔍 Mystery", genres: "9648,80" },
  { label: "📄 Documentary", genres: "99" },
];

const DECADES = [
  { label: "Any Era", min: "", max: "" },
  { label: "2020s", min: "2020-01-01", max: "2029-12-31" },
  { label: "2010s", min: "2010-01-01", max: "2019-12-31" },
  { label: "2000s", min: "2000-01-01", max: "2009-12-31" },
  { label: "90s", min: "1990-01-01", max: "1999-12-31" },
  { label: "80s", min: "1980-01-01", max: "1989-12-31" },
  { label: "Classics", min: "1920-01-01", max: "1979-12-31" },
];

export default function RoulettePage() {
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [mood, setMood] = useState(MOODS[0]);
  const [decade, setDecade] = useState(DECADES[0]);
  const [minRating, setMinRating] = useState("6");
  const [provider, setProvider] = useState<number | null>(null);
  const [result, setResult] = useState<TMDBMedia | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const spin = useCallback(async () => {
    setSpinning(true);
    setResult(null);

    try {
      // Get a random page first
      const randomPage = Math.floor(Math.random() * 5) + 1;

      const params: Record<string, string> = {
        page: String(randomPage),
        sort_by: "popularity.desc",
        "vote_average.gte": minRating,
        "vote_count.gte": "50",
      };

      if (mood.genres) params.with_genres = mood.genres;
      if (provider) params.with_watch_providers = String(provider);
      if (decade.min) {
        if (contentType === "movie") {
          params["primary_release_date.gte"] = decade.min;
          params["primary_release_date.lte"] = decade.max;
        } else {
          params["first_air_date.gte"] = decade.min;
          params["first_air_date.lte"] = decade.max;
        }
      }

      const data = contentType === "movie"
        ? await discoverMovies(params)
        : await discoverTV(params);

      const candidates = data.results.filter((m) => m.poster_path && m.overview);

      if (candidates.length === 0) {
        setSpinning(false);
        setHasSpun(true);
        return;
      }

      // Animate through a few random picks
      for (let i = 0; i < 6; i++) {
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        setResult(randomItem);
        await new Promise((r) => setTimeout(r, 120 + i * 60));
      }

      // Final pick
      const finalPick = candidates[Math.floor(Math.random() * candidates.length)];
      setResult(finalPick);
      setSpinning(false);
      setHasSpun(true);
    } catch {
      setSpinning(false);
      setHasSpun(true);
    }
  }, [contentType, mood, decade, minRating, provider]);

  return (
    <>
      <div className="roulette-hero">
        <h1 className="roulette-title">
          <span className="roulette-icon">🎰</span>
          What Should I Watch?
        </h1>
        <p className="roulette-subtitle">
          Can&apos;t decide? Set your filters and let fate choose for you.
        </p>
      </div>

      <div className="page-section" style={{ paddingTop: "var(--space-xl)" }}>
        {/* Filters */}
        <div className="roulette-filters">
          {/* Content type toggle */}
          <div className="roulette-filter-group">
            <label className="roulette-label">Type</label>
            <div className="roulette-toggle">
              <button
                className={`roulette-toggle-btn ${contentType === "movie" ? "active" : ""}`}
                onClick={() => setContentType("movie")}
              >
                🎬 Movie
              </button>
              <button
                className={`roulette-toggle-btn ${contentType === "tv" ? "active" : ""}`}
                onClick={() => setContentType("tv")}
              >
                📺 TV Show
              </button>
            </div>
          </div>

          {/* Mood/Genre */}
          <div className="roulette-filter-group">
            <label className="roulette-label">Mood</label>
            <div className="roulette-mood-grid">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  className={`roulette-mood-btn ${mood.label === m.label ? "active" : ""}`}
                  onClick={() => setMood(m)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Decade */}
          <div className="roulette-filter-group">
            <label className="roulette-label">Era</label>
            <div className="roulette-mood-grid">
              {DECADES.map((d) => (
                <button
                  key={d.label}
                  className={`roulette-mood-btn ${decade.label === d.label ? "active" : ""}`}
                  onClick={() => setDecade(d)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div className="roulette-filter-group">
            <label className="roulette-label">Minimum Rating: {minRating}/10</label>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="roulette-slider"
            />
          </div>

          {/* Streaming Service */}
          <div className="roulette-filter-group">
            <label className="roulette-label">Streaming Service</label>
            <div className="roulette-mood-grid">
              <button
                className={`roulette-mood-btn ${provider === null ? "active" : ""}`}
                onClick={() => setProvider(null)}
              >
                Any
              </button>
              {STREAMING_PROVIDERS.slice(0, 8).map((s) => (
                <button
                  key={s.id}
                  className={`roulette-mood-btn ${provider === s.id ? "active" : ""}`}
                  onClick={() => setProvider(s.id)}
                >
                  {s.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <div className="roulette-spin-area">
          <button
            className={`roulette-spin-btn ${spinning ? "spinning" : ""}`}
            onClick={spin}
            disabled={spinning}
          >
            {spinning ? (
              <>
                <span className="spin-icon">🎰</span>
                Spinning...
              </>
            ) : hasSpun ? (
              <>
                <span className="spin-icon">🔄</span>
                Spin Again
              </>
            ) : (
              <>
                <span className="spin-icon">🎰</span>
                Spin the Roulette!
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && !spinning && (
          <div className="roulette-result animate-fade-in">
            <div className="roulette-result-card">
              <div className="roulette-result-poster">
                <Image
                  src={getPosterUrl(result.poster_path, "w500")}
                  alt={getDisplayTitle(result)}
                  width={260}
                  height={390}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div className="roulette-result-info">
                <div className="roulette-result-badge">Your Pick 🎉</div>
                <h2 className="roulette-result-title">{getDisplayTitle(result)}</h2>
                <div className="roulette-result-meta">
                  <span className="detail-rating">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {formatRating(result.vote_average)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{getDisplayYear(result)}</span>
                </div>
                <p className="roulette-result-overview">{result.overview}</p>
                <Link
                  href={`/${contentType}/${result.id}`}
                  className="btn-primary"
                  style={{ marginTop: "var(--space-lg)", display: "inline-flex", gap: 8, alignItems: "center" }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="m15 12-5-3v6l5-3z" fill="currentColor" />
                  </svg>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {hasSpun && !result && !spinning && (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">😅</div>
            <div className="empty-state-title">No results found</div>
            <p>Try loosening your filters — lower the minimum rating or pick a broader mood.</p>
          </div>
        )}

        {spinning && result && (
          <div className="roulette-result roulette-spinning-preview">
            <div className="roulette-result-card" style={{ opacity: 0.5, filter: "blur(1px)" }}>
              <div className="roulette-result-poster">
                <Image
                  src={getPosterUrl(result.poster_path, "w500")}
                  alt=""
                  width={260}
                  height={390}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div className="roulette-result-info">
                <h2 className="roulette-result-title">{getDisplayTitle(result)}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
