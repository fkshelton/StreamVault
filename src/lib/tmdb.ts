const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "";
export const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

export const POSTER_SIZES = {
  small: "w185",
  medium: "w342",
  large: "w500",
  original: "original",
};

export const BACKDROP_SIZES = {
  small: "w300",
  medium: "w780",
  large: "w1280",
  original: "original",
};

export function getPosterUrl(path: string | null, size = POSTER_SIZES.medium): string {
  if (!path) return "/placeholder-poster.svg";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size = BACKDROP_SIZES.large): string {
  if (!path) return "/placeholder-backdrop.svg";
  return `${IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status} ${endpoint}`);
  return res.json();
}

// Types
export interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: "movie" | "tv" | "person";
  popularity: number;
  original_language?: string;
}

export interface TMDBMovieDetail extends TMDBMedia {
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBTVDetail extends TMDBMedia {
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string;
  episode_run_time: number[];
  networks: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface TMDBProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}

export interface TMDBWatchProviders {
  results: {
    US?: {
      link: string;
      flatrate?: TMDBProvider[];
      rent?: TMDBProvider[];
      buy?: TMDBProvider[];
      free?: TMDBProvider[];
    };
  };
}

export interface TMDBPage<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

// Default region & language for US-only content
const DEFAULT_REGION = "US";
const DEFAULT_LANGUAGE = "en-US";

// API calls
export async function getTrending(
  type: "movie" | "tv" | "all" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch(`/trending/${type}/${timeWindow}`, { language: DEFAULT_LANGUAGE });
}

export async function getPopularMovies(page = 1): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch("/movie/popular", { page: String(page), region: DEFAULT_REGION, language: DEFAULT_LANGUAGE });
}

export async function getPopularTV(page = 1): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch("/discover/tv", {
    page: String(page),
    language: DEFAULT_LANGUAGE,
    watch_region: DEFAULT_REGION,
    with_origin_country: "US",
    sort_by: "popularity.desc",
  });
}

export async function getNowPlaying(page = 1): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch("/movie/now_playing", { page: String(page), region: DEFAULT_REGION, language: DEFAULT_LANGUAGE });
}

export async function getTopRated(type: "movie" | "tv" = "movie", page = 1): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch(`/${type}/top_rated`, { page: String(page), region: DEFAULT_REGION, language: DEFAULT_LANGUAGE });
}

export async function getUpcoming(page = 1): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch("/movie/upcoming", { page: String(page), region: DEFAULT_REGION, language: DEFAULT_LANGUAGE });
}

export async function getMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch(`/movie/${id}`, { language: DEFAULT_LANGUAGE });
}

export async function getTVDetail(id: number): Promise<TMDBTVDetail> {
  return tmdbFetch(`/tv/${id}`, { language: DEFAULT_LANGUAGE });
}

export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch(`/movie/${id}/credits`, { language: DEFAULT_LANGUAGE });
}

export async function getTVCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch(`/tv/${id}/credits`, { language: DEFAULT_LANGUAGE });
}

export async function getMovieWatchProviders(id: number): Promise<TMDBWatchProviders> {
  return tmdbFetch(`/movie/${id}/watch/providers`);
}

export async function getTVWatchProviders(id: number): Promise<TMDBWatchProviders> {
  return tmdbFetch(`/tv/${id}/watch/providers`);
}

export async function getSimilarMovies(id: number): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch(`/movie/${id}/similar`, { language: DEFAULT_LANGUAGE });
}

export async function getSimilarTV(id: number): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch(`/tv/${id}/similar`, { language: DEFAULT_LANGUAGE });
}

export async function getMovieVideos(id: number): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch(`/movie/${id}/videos`, { language: DEFAULT_LANGUAGE });
}

export async function getTVVideos(id: number): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch(`/tv/${id}/videos`, { language: DEFAULT_LANGUAGE });
}

export async function getMovieRecommendations(id: number): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch(`/movie/${id}/recommendations`, { language: DEFAULT_LANGUAGE });
}

export async function getTVRecommendations(id: number): Promise<TMDBPage<TMDBMedia>> {
  return tmdbFetch(`/tv/${id}/recommendations`, { language: DEFAULT_LANGUAGE });
}

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbFetch("/genre/movie/list", { language: DEFAULT_LANGUAGE });
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbFetch("/genre/tv/list", { language: DEFAULT_LANGUAGE });
}

export async function searchMulti(query: string, page = 1): Promise<TMDBPage<TMDBMedia>> {
  const data: TMDBPage<TMDBMedia> = await tmdbFetch("/search/multi", { query, page: String(page), include_adult: "false", language: DEFAULT_LANGUAGE, region: DEFAULT_REGION });
  // Filter to English-language content only
  data.results = data.results.filter((item) => item.original_language === "en" || !item.original_language);
  return data;
}

export async function discoverMovies(params: {
  page?: number;
  with_genres?: string;
  with_watch_providers?: string;
  watch_region?: string;
  sort_by?: string;
  "vote_average.gte"?: string;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
} = {}): Promise<TMDBPage<TMDBMedia>> {
  const p: Record<string, string> = { watch_region: DEFAULT_REGION, region: DEFAULT_REGION, language: DEFAULT_LANGUAGE };
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined) p[k] = String(v); });
  return tmdbFetch("/discover/movie", p);
}

export async function discoverTV(params: {
  page?: number;
  with_genres?: string;
  with_watch_providers?: string;
  watch_region?: string;
  sort_by?: string;
  "vote_average.gte"?: string;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
} = {}): Promise<TMDBPage<TMDBMedia>> {
  const p: Record<string, string> = { watch_region: DEFAULT_REGION, language: DEFAULT_LANGUAGE, with_origin_country: "US" };
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined) p[k] = String(v); });
  return tmdbFetch("/discover/tv", p);
}

export function getDisplayTitle(media: TMDBMedia): string {
  return media.title || media.name || "Unknown";
}

export function getDisplayYear(media: TMDBMedia): string {
  const date = media.release_date || media.first_air_date;
  return date ? date.slice(0, 4) : "";
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Known streaming providers with colors
export const STREAMING_PROVIDERS = [
  { id: 8, name: "Netflix", color: "#E50914", shortName: "Netflix" },
  { id: 337, name: "Disney Plus", color: "#113CCF", shortName: "Disney+" },
  { id: 9, name: "Amazon Prime Video", color: "#00A8E0", shortName: "Prime" },
  { id: 350, name: "Apple TV Plus", color: "#000000", shortName: "Apple TV+" },
  { id: 15, name: "Hulu", color: "#1CE783", shortName: "Hulu" },
  { id: 1899, name: "Max", color: "#002BE7", shortName: "Max" },
  { id: 386, name: "Peacock", color: "#FFD600", shortName: "Peacock" },
  { id: 531, name: "Paramount Plus", color: "#0064FF", shortName: "Paramount+" },
  { id: 2, name: "Apple iTunes", color: "#FC3C44", shortName: "iTunes" },
  { id: 3, name: "Google Play Movies", color: "#34A853", shortName: "Google Play" },
];
