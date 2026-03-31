"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMedia, getBackdropUrl, getDisplayTitle, getDisplayYear, formatRating } from "@/lib/tmdb";
import { useWatchlist } from "@/lib/watchlist-context";

interface HeroCarouselProps {
  items: TMDBMedia[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const { toggle, isInWatchlist } = useWatchlist();

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, paused, items.length]);

  if (!items || items.length === 0) return null;

  const item = items[current];
  const mediaType = (item.media_type as "movie" | "tv") || "movie";
  const title = getDisplayTitle(item);
  const year = getDisplayYear(item);
  const inList = isInWatchlist(item.id, mediaType);

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((slide, i) => (
        <div key={slide.id} className={`hero-slide ${i === current ? "active" : ""}`}>
          <Image
            src={getBackdropUrl(slide.backdrop_path)}
            alt={getDisplayTitle(slide)}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectFit: "cover" }}
            className="hero-backdrop"
            unoptimized={!slide.backdrop_path}
          />
        </div>
      ))}

      <div className="hero-gradient" />

      <div className="hero-content page-container">
        <div className="hero-badge">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Trending {mediaType === "tv" ? "TV Show" : "Movie"}
        </div>

        <h1 className="hero-title">{title}</h1>

        <div className="hero-meta">
          {item.vote_average > 0 && (
            <span className="hero-rating">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {formatRating(item.vote_average)} / 10
            </span>
          )}
          {year && <span className="hero-year">{year}</span>}
        </div>

        {item.overview && (
          <p className="hero-overview">{item.overview}</p>
        )}

        <div className="hero-actions">
          <Link href={`/${mediaType}/${item.id}`} className="btn-primary" id={`hero-more-info-${item.id}`}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            More Info
          </Link>
          <button
            className="btn-secondary"
            onClick={() => toggle({ id: item.id, type: mediaType, title, poster_path: item.poster_path, vote_average: item.vote_average, release_date: item.release_date, first_air_date: item.first_air_date })}
            id={`hero-watchlist-${item.id}`}
          >
            <svg width="18" height="18" fill={inList ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {inList ? "In Watchlist" : "Add to Watchlist"}
          </button>
        </div>
      </div>

      <div className="hero-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            id={`hero-dot-${i}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
