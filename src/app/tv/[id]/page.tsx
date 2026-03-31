import Image from "next/image";
import {
  getTVDetail, getTVCredits, getTVWatchProviders, getSimilarTV,
  getTVVideos, getPosterUrl, getBackdropUrl, formatRating, IMAGE_BASE,
} from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import WatchlistBtn from "@/components/WatchlistBtn";
import TrailerSection from "@/components/TrailerSection";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await getTVDetail(Number(id));
    return {
      title: `${show.name} (${show.first_air_date?.slice(0, 4)})`,
      description: show.overview,
    };
  } catch {
    return { title: "TV Show Details" };
  }
}

export default async function TVDetailPage({ params }: Props) {
  const { id } = await params;
  const showId = Number(id);

  const [show, credits, providers, similar, videos] = await Promise.all([
    getTVDetail(showId),
    getTVCredits(showId),
    getTVWatchProviders(showId),
    getSimilarTV(showId),
    getTVVideos(showId),
  ]);

  const us = providers.results?.US;
  const creators = credits.crew.filter((c) => c.job === "Executive Producer").slice(0, 2);
  const topCast = credits.cast.slice(0, 10);
  const epRuntime = show.episode_run_time?.[0];

  return (
    <>
      <div className="detail-hero">
        <Image
          src={getBackdropUrl(show.backdrop_path)}
          alt={show.name || ""}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
          className="detail-hero-backdrop"
          unoptimized={!show.backdrop_path}
        />
        <div className="detail-hero-gradient" />
      </div>

      <div className="page-section" style={{ paddingTop: "var(--space-2xl)" }}>
        <div className="detail-layout">
          <div>
            <div className="detail-poster">
              <Image
                src={getPosterUrl(show.poster_path, "w500")}
                alt={show.name || ""}
                width={240}
                height={360}
                style={{ width: "100%", height: "auto" }}
                unoptimized={!show.poster_path}
              />
            </div>
          </div>

          <div>
            <div className="hero-badge" style={{ marginBottom: "var(--space-sm)" }}>TV Series</div>
            <h1 className="detail-title">{show.name}</h1>
            {show.tagline && <p className="detail-tagline">&quot;{show.tagline}&quot;</p>}

            <div className="detail-meta-row">
              {show.vote_average > 0 && (
                <span className="detail-rating">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {formatRating(show.vote_average)} / 10
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 400 }}>
                    ({show.vote_count.toLocaleString()} votes)
                  </span>
                </span>
              )}
              {show.first_air_date && <span style={{ color: "var(--text-secondary)" }}>{show.first_air_date.slice(0, 4)}</span>}
              {show.number_of_seasons && (
                <span style={{ color: "var(--text-secondary)" }}>
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
                </span>
              )}
              {epRuntime && <span style={{ color: "var(--text-secondary)" }}>{epRuntime}m / ep</span>}
              <span style={{
                background: show.status === "Ended" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                color: show.status === "Ended" ? "#ef4444" : "#10b981",
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}>{show.status}</span>
            </div>

            {show.genres && show.genres.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)", marginBottom: "var(--space-lg)" }}>
                {show.genres.map((g) => (
                  <span key={g.id} className="detail-genre-tag">{g.name}</span>
                ))}
              </div>
            )}

            {show.overview && <p className="detail-overview">{show.overview}</p>}

            {show.networks && show.networks.length > 0 && (
              <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-lg)", fontSize: "0.9rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>Network:</strong>{" "}
                {show.networks.map((n) => n.name).join(", ")}
              </p>
            )}

            <WatchlistBtn
              media={{ id: show.id, type: "tv", title: show.name || "", poster_path: show.poster_path, vote_average: show.vote_average, first_air_date: show.first_air_date }}
            />
          </div>
        </div>

        {/* Where to Watch */}
        {us && (us.flatrate || us.rent || us.buy || us.free) ? (
          <div className="watch-section" style={{ marginTop: "var(--space-2xl)" }}>
            <h2 className="watch-section-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="m8 21 4-4 4 4" /><path d="M12 17v4" />
              </svg>
              Where to Watch
            </h2>
            {us.flatrate && us.flatrate.length > 0 && (
              <>
                <p className="watch-group-label">Stream</p>
                <div className="watch-providers-row">
                  {us.flatrate.map((p) => (
                    <a key={p.provider_id} href={us.link} target="_blank" rel="noopener noreferrer" className="watch-provider-item" id={`provider-stream-tv-${p.provider_id}`}>
                      <Image src={`${IMAGE_BASE}/w92${p.logo_path}`} alt={p.provider_name} width={48} height={48} className="watch-provider-logo" />
                      <span className="watch-provider-name">{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
            {us.free && us.free.length > 0 && (
              <>
                <p className="watch-group-label" style={{ marginTop: "var(--space-md)" }}>Free</p>
                <div className="watch-providers-row">
                  {us.free.map((p) => (
                    <a key={p.provider_id} href={us.link} target="_blank" rel="noopener noreferrer" className="watch-provider-item">
                      <Image src={`${IMAGE_BASE}/w92${p.logo_path}`} alt={p.provider_name} width={48} height={48} className="watch-provider-logo" />
                      <span className="watch-provider-name">{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
            {us.rent && us.rent.length > 0 && (
              <>
                <p className="watch-group-label" style={{ marginTop: "var(--space-md)" }}>Rent</p>
                <div className="watch-providers-row">
                  {us.rent.map((p) => (
                    <a key={p.provider_id} href={us.link} target="_blank" rel="noopener noreferrer" className="watch-provider-item">
                      <Image src={`${IMAGE_BASE}/w92${p.logo_path}`} alt={p.provider_name} width={48} height={48} className="watch-provider-logo" />
                      <span className="watch-provider-name">{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
            {us.buy && us.buy.length > 0 && (
              <>
                <p className="watch-group-label" style={{ marginTop: "var(--space-md)" }}>Buy</p>
                <div className="watch-providers-row">
                  {us.buy.map((p) => (
                    <a key={p.provider_id} href={us.link} target="_blank" rel="noopener noreferrer" className="watch-provider-item">
                      <Image src={`${IMAGE_BASE}/w92${p.logo_path}`} alt={p.provider_name} width={48} height={48} className="watch-provider-logo" />
                      <span className="watch-provider-name">{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="watch-section" style={{ marginTop: "var(--space-2xl)" }}>
            <h2 className="watch-section-title">Where to Watch</h2>
            <p style={{ color: "var(--text-muted)" }}>No streaming info available for your region.</p>
          </div>
        )}

        {/* Trailers */}
        <TrailerSection videos={videos.results} />

        {/* Cast */}
        {topCast.length > 0 && (
          <div style={{ marginTop: "var(--space-2xl)" }}>
            <h2 className="section-title">Cast</h2>
            <div className="cast-grid">
              {topCast.map((person) => (
                <div key={person.id} className="cast-card">
                  <div className="cast-photo">
                    <Image
                      src={person.profile_path ? `${IMAGE_BASE}/w185${person.profile_path}` : "/placeholder-person.svg"}
                      alt={person.name}
                      width={100}
                      height={150}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      unoptimized={!person.profile_path}
                    />
                  </div>
                  <div className="cast-info">
                    <div className="cast-name">{person.name}</div>
                    <div className="cast-character">{person.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {similar.results.length > 0 && (
          <div style={{ marginTop: "var(--space-2xl)" }}>
            <h2 className="section-title">Similar Shows</h2>
            <div className="media-row">
              {similar.results.slice(0, 12).map((s) => (
                <MediaCard key={s.id} media={s} type="tv" />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
