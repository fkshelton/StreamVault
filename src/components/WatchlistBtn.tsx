"use client";
import { useState } from "react";
import { useWatchlist } from "@/lib/watchlist-context";
import StarRating from "@/components/StarRating";

interface WatchlistBtnProps {
  media: {
    id: number;
    type: "movie" | "tv";
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
  };
}

export default function WatchlistBtn({ media }: WatchlistBtnProps) {
  const { toggle, isInWatchlist, markWatched, isWatched, getWatchedItem, updateRating, removeWatched } = useWatchlist();
  const inList = isInWatchlist(media.id, media.type);
  const watched = isWatched(media.id, media.type);
  const watchedItem = getWatchedItem(media.id, media.type);
  const [showRating, setShowRating] = useState(false);

  return (
    <div className="detail-actions-row">
      {/* Watchlist button */}
      <button
        className={inList ? "btn-secondary" : "btn-primary"}
        onClick={() => toggle(media)}
        id={`detail-watchlist-btn-${media.type}-${media.id}`}
        style={{ gap: "var(--space-sm)", display: "inline-flex", alignItems: "center" }}
      >
        <svg width="18" height="18" fill={inList ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {inList ? "In Watchlist" : "Add to Watchlist"}
      </button>

      {/* Watched button */}
      {watched ? (
        <div className="watched-status">
          <button
            className="btn-watched"
            onClick={() => removeWatched(media.id, media.type)}
            title="Click to remove from watched"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Watched
          </button>
          <StarRating
            rating={watchedItem?.rating || 0}
            onRate={(r) => updateRating(media.id, media.type, r)}
            size={22}
          />
        </div>
      ) : (
        <button
          className="btn-outline"
          onClick={() => {
            setShowRating(true);
            markWatched(media);
          }}
          style={{ gap: "var(--space-sm)", display: "inline-flex", alignItems: "center" }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Mark as Watched
        </button>
      )}

      {/* Rating popup */}
      {showRating && !watchedItem?.rating && (
        <div className="rating-popup animate-fade-in">
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Rate it:</span>
          <StarRating
            rating={0}
            onRate={(r) => {
              updateRating(media.id, media.type, r);
              setShowRating(false);
            }}
            size={24}
          />
          <button
            className="rating-skip"
            onClick={() => setShowRating(false)}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
