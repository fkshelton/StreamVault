"use client";
import Image from "next/image";
import Link from "next/link";
import { TMDBMedia, TMDBProvider, getDisplayTitle, getDisplayYear, formatRating, getPosterUrl, IMAGE_BASE } from "@/lib/tmdb";
import { useWatchlist } from "@/lib/watchlist-context";

interface MediaCardProps {
  media: TMDBMedia;
  type?: "movie" | "tv";
  providers?: TMDBProvider[];
  showType?: boolean;
}

export default function MediaCard({ media, type, providers, showType = false }: MediaCardProps) {
  const { toggle, isInWatchlist } = useWatchlist();
  const mediaType = type || (media.media_type as "movie" | "tv") || "movie";
  const href = `/${mediaType}/${media.id}`;
  const title = getDisplayTitle(media);
  const year = getDisplayYear(media);
  const rating = formatRating(media.vote_average);
  const inList = isInWatchlist(media.id, mediaType);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: media.id,
      type: mediaType,
      title,
      poster_path: media.poster_path,
      vote_average: media.vote_average,
      release_date: media.release_date,
      first_air_date: media.first_air_date,
    });
  };

  return (
    <Link href={href} className="media-card" id={`media-card-${mediaType}-${media.id}`}>
      <div className="media-card-poster">
        <Image
          src={getPosterUrl(media.poster_path)}
          alt={title}
          fill
          sizes="(max-width: 640px) 160px, 200px"
          style={{ objectFit: "cover" }}
          unoptimized={!media.poster_path}
        />
        <div className="media-card-overlay">
          {providers && providers.length > 0 && (
            <div className="media-card-providers">
              {providers.slice(0, 4).map((p) => (
                <Image
                  key={p.provider_id}
                  src={`${IMAGE_BASE}/w45${p.logo_path}`}
                  alt={p.provider_name}
                  width={24}
                  height={24}
                  className="provider-logo"
                  title={p.provider_name}
                />
              ))}
            </div>
          )}
        </div>

        {media.vote_average > 0 && (
          <div className="media-card-rating">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </div>
        )}

        {showType && mediaType && (
          <div className="media-card-type">
            {mediaType === "movie" ? "Movie" : "TV"}
          </div>
        )}

        <button
          className={`media-card-wishlist ${inList ? "in-list" : ""}`}
          onClick={handleWatchlist}
          title={inList ? "Remove from watchlist" : "Add to watchlist"}
          id={`watchlist-toggle-${mediaType}-${media.id}`}
          aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
        >
          <svg width="16" height="16" fill={inList ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <div className="media-card-info">
        <div className="media-card-title" title={title}>{title}</div>
        <div className="media-card-year">{year}</div>
      </div>
    </Link>
  );
}
