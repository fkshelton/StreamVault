"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWatchlist } from "@/lib/watchlist-context";
import { getPosterUrl, getDisplayYear, formatRating } from "@/lib/tmdb";
import StarRating from "@/components/StarRating";

export default function WatchlistPage() {
  const { items, remove, watched, removeWatched, updateRating } = useWatchlist();
  const [tab, setTab] = useState<"watchlist" | "watched">("watchlist");

  const totalHoursEstimate = watched.length * 2; // rough estimate: 2 hrs per item

  return (
    <div>
      <div className="watchlist-header">
        <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "var(--space-sm)" }}>
          My Library
        </h1>
        <div className="watchlist-tabs">
          <button
            className={`watchlist-tab ${tab === "watchlist" ? "active" : ""}`}
            onClick={() => setTab("watchlist")}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Watchlist ({items.length})
          </button>
          <button
            className={`watchlist-tab ${tab === "watched" ? "active" : ""}`}
            onClick={() => setTab("watched")}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
            Watched ({watched.length})
          </button>
        </div>
      </div>

      <div className="page-section" style={{ paddingTop: 0 }}>
        {tab === "watchlist" ? (
          <>
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎬</div>
                <div className="empty-state-title">Your watchlist is empty</div>
                <p style={{ marginBottom: "var(--space-lg)" }}>
                  Browse movies and TV shows and bookmark anything you want to watch
                </p>
                <Link href="/" className="btn-primary">Discover Content</Link>
              </div>
            ) : (
              <div className="media-grid animate-fade-in">
                {items.map((item) => (
                  <div key={`${item.type}-${item.id}`} style={{ position: "relative" }}>
                    <Link href={`/${item.type}/${item.id}`} className="media-card" id={`watchlist-item-${item.type}-${item.id}`}>
                      <div className="media-card-poster">
                        <Image src={getPosterUrl(item.poster_path)} alt={item.title} fill sizes="200px" style={{ objectFit: "cover" }} unoptimized={!item.poster_path} />
                        <div className="media-card-type">{item.type === "movie" ? "Movie" : "TV"}</div>
                        {item.vote_average > 0 && (
                          <div className="media-card-rating">
                            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {formatRating(item.vote_average)}
                          </div>
                        )}
                      </div>
                      <div className="media-card-info">
                        <div className="media-card-title">{item.title}</div>
                        <div className="media-card-year">{getDisplayYear({ ...item, media_type: item.type } as never)}</div>
                      </div>
                    </Link>
                    <button
                      onClick={() => remove(item.id, item.type)}
                      title="Remove from watchlist"
                      className="card-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {watched.length > 0 && (
              <div className="watched-stats animate-fade-in">
                <div className="watched-stat">
                  <div className="watched-stat-value">{watched.length}</div>
                  <div className="watched-stat-label">Titles Watched</div>
                </div>
                <div className="watched-stat">
                  <div className="watched-stat-value">~{totalHoursEstimate}h</div>
                  <div className="watched-stat-label">Time Spent</div>
                </div>
                <div className="watched-stat">
                  <div className="watched-stat-value">
                    {watched.filter(w => w.rating > 0).length > 0
                      ? (watched.filter(w => w.rating > 0).reduce((sum, w) => sum + w.rating, 0) / watched.filter(w => w.rating > 0).length).toFixed(1)
                      : "—"}
                  </div>
                  <div className="watched-stat-label">Avg Rating</div>
                </div>
                <div className="watched-stat">
                  <div className="watched-stat-value">{watched.filter(w => w.type === "movie").length}</div>
                  <div className="watched-stat-label">Movies</div>
                </div>
                <div className="watched-stat">
                  <div className="watched-stat-value">{watched.filter(w => w.type === "tv").length}</div>
                  <div className="watched-stat-label">TV Shows</div>
                </div>
              </div>
            )}

            {watched.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">Nothing watched yet</div>
                <p style={{ marginBottom: "var(--space-lg)" }}>
                  Mark movies and shows as watched and rate them to build your film diary
                </p>
                <Link href="/" className="btn-primary">Start Watching</Link>
              </div>
            ) : (
              <div className="media-grid animate-fade-in">
                {watched.map((item) => (
                  <div key={`${item.type}-${item.id}`} style={{ position: "relative" }}>
                    <Link href={`/${item.type}/${item.id}`} className="media-card" id={`watched-item-${item.type}-${item.id}`}>
                      <div className="media-card-poster">
                        <Image src={getPosterUrl(item.poster_path)} alt={item.title} fill sizes="200px" style={{ objectFit: "cover" }} unoptimized={!item.poster_path} />
                        <div className="media-card-watched-badge">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                        </div>
                      </div>
                      <div className="media-card-info">
                        <div className="media-card-title">{item.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          {item.rating > 0 && <StarRating rating={item.rating} size={14} readonly />}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => removeWatched(item.id, item.type)}
                      title="Remove from watched"
                      className="card-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
