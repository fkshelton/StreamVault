"use client";
import { useState, useEffect, useCallback } from "react";
import { discoverMovies, getMovieGenres, TMDBMedia, TMDBGenre } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import ProviderFilter from "@/components/ProviderFilter";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest First" },
  { value: "revenue.desc", label: "Top Grossing" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMedia[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getMovieGenres().then((d) => setGenres(d.genres));
  }, []);

  const fetchMovies = useCallback(async (reset = true) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    const currentPage = reset ? 1 : page + 1;
    try {
      const params: Parameters<typeof discoverMovies>[0] = {
        sort_by: sortBy,
        page: currentPage,
      };
      if (selectedGenre) params.with_genres = selectedGenre;
      if (selectedYear) {
        params["primary_release_date.gte"] = `${selectedYear}-01-01`;
        params["primary_release_date.lte"] = `${selectedYear}-12-31`;
      }
      if (selectedProviders.length > 0) {
        params.with_watch_providers = selectedProviders.join("|");
        params.watch_region = "US";
      }
      if (sortBy === "vote_average.desc") params["vote_average.gte"] = "6";
      const data = await discoverMovies(params);
      setMovies((prev) => reset ? data.results : [...prev, ...data.results]);
      setTotalPages(data.total_pages);
      if (reset) setPage(1); else setPage(currentPage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre, selectedYear, selectedProviders, sortBy, page]);

  useEffect(() => {
    fetchMovies(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, selectedYear, selectedProviders, sortBy]);

  const toggleProvider = (id: number) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-section">
      <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "var(--space-xl)" }}>
        Movies
      </h1>

      <ProviderFilter selected={selectedProviders} onToggle={toggleProvider} />

      <div className="filter-bar">
        <select
          className="filter-select"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          id="movies-genre-filter"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          id="movies-year-filter"
        >
          <option value="">Any Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          id="movies-sort-filter"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="media-grid">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <div className="empty-state-title">No movies found</div>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="media-grid animate-fade-in">
            {movies.map((m) => (
              <MediaCard key={m.id} media={m} type="movie" />
            ))}
          </div>
          {page < totalPages && (
            <button
              className="load-more-btn"
              onClick={() => fetchMovies(false)}
              disabled={loadingMore}
              id="movies-load-more"
            >
              {loadingMore ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, margin: 0 }} />
                  Loading...
                </>
              ) : "Load More"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
