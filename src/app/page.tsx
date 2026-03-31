import { getTrending, getPopularMovies, getPopularTV, getNowPlaying } from "@/lib/tmdb";
import HeroCarousel from "@/components/HeroCarousel";
import MediaCard from "@/components/MediaCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StreamVault — Find Where to Watch Movies & TV Shows",
};

export default async function HomePage() {
  const [trending, popularMovies, popularTV, nowPlaying] = await Promise.all([
    getTrending("all", "week"),
    getPopularMovies(),
    getPopularTV(),
    getNowPlaying(),
  ]);
  // Filter trending to English-only (TMDB trending is global, no region param)
  const trendingEN = {
    ...trending,
    results: trending.results.filter((m) => m.original_language === "en"),
  };

  const heroItems = trendingEN.results
    .filter((m) => m.backdrop_path && m.overview)
    .slice(0, 8);

  return (
    <>
      <HeroCarousel items={heroItems} />

      <div style={{ background: "linear-gradient(to bottom, rgba(9,9,15,0) 0%, var(--bg-primary) 100%)", height: 80, marginTop: -80, position: "relative", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Trending */}
        <section className="page-section" style={{ paddingBottom: 0 }}>
          <h2 className="section-title">Trending This Week</h2>
          <div className="media-row">
            {trendingEN.results.slice(0, 16).map((item) => (
              <MediaCard
                key={`${item.id}-${item.media_type}`}
                media={item}
                type={(item.media_type as "movie" | "tv") || "movie"}
                showType
              />
            ))}
          </div>
        </section>

        {/* Now Playing */}
        <section className="page-section" style={{ paddingBottom: 0 }}>
          <h2 className="section-title">Now Playing in Theaters</h2>
          <div className="media-row">
            {nowPlaying.results.slice(0, 16).map((item) => (
              <MediaCard key={item.id} media={item} type="movie" />
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section className="page-section" style={{ paddingBottom: 0 }}>
          <h2 className="section-title">Popular Movies</h2>
          <div className="media-row">
            {popularMovies.results.slice(0, 16).map((item) => (
              <MediaCard key={item.id} media={item} type="movie" />
            ))}
          </div>
        </section>

        {/* Popular TV */}
        <section className="page-section">
          <h2 className="section-title">Popular TV Shows</h2>
          <div className="media-row">
            {popularTV.results.slice(0, 16).map((item) => (
              <MediaCard key={item.id} media={item} type="tv" />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
