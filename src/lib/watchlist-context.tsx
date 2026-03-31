"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface WatchlistItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface WatchedItem extends WatchlistItem {
  rating: number; // 0.5 - 5 in 0.5 increments (0 = unrated)
  watchedAt: string; // ISO date string
}

interface WatchlistContextType {
  // Watchlist (want to watch)
  items: WatchlistItem[];
  add: (item: WatchlistItem) => void;
  remove: (id: number, type: "movie" | "tv") => void;
  isInWatchlist: (id: number, type: "movie" | "tv") => boolean;
  toggle: (item: WatchlistItem) => void;
  // Watched (already seen + rating)
  watched: WatchedItem[];
  markWatched: (item: WatchlistItem, rating?: number) => void;
  removeWatched: (id: number, type: "movie" | "tv") => void;
  isWatched: (id: number, type: "movie" | "tv") => boolean;
  getWatchedItem: (id: number, type: "movie" | "tv") => WatchedItem | undefined;
  updateRating: (id: number, type: "movie" | "tv", rating: number) => void;
}

const WatchlistContext = createContext<WatchlistContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  isInWatchlist: () => false,
  toggle: () => {},
  watched: [],
  markWatched: () => {},
  removeWatched: () => {},
  isWatched: () => false,
  getWatchedItem: () => undefined,
  updateRating: () => {},
});

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("streamvault_watchlist");
      if (stored) setItems(JSON.parse(stored));
      const storedWatched = localStorage.getItem("streamvault_watched");
      if (storedWatched) setWatched(JSON.parse(storedWatched));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("streamvault_watchlist", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("streamvault_watched", JSON.stringify(watched));
  }, [watched]);

  // Watchlist functions
  const add = (item: WatchlistItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id && i.type === item.type)) return prev;
      return [item, ...prev];
    });
  };

  const remove = (id: number, type: "movie" | "tv") => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  const isInWatchlist = (id: number, type: "movie" | "tv") =>
    items.some((i) => i.id === id && i.type === type);

  const toggle = (item: WatchlistItem) => {
    if (isInWatchlist(item.id, item.type)) {
      remove(item.id, item.type);
    } else {
      add(item);
    }
  };

  // Watched functions
  const markWatched = (item: WatchlistItem, rating = 0) => {
    setWatched((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) return prev;
      return [{ ...item, rating, watchedAt: new Date().toISOString() }, ...prev];
    });
    // Auto-remove from watchlist when marked as watched
    remove(item.id, item.type);
  };

  const removeWatched = (id: number, type: "movie" | "tv") => {
    setWatched((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  const isWatched = (id: number, type: "movie" | "tv") =>
    watched.some((i) => i.id === id && i.type === type);

  const getWatchedItem = (id: number, type: "movie" | "tv") =>
    watched.find((i) => i.id === id && i.type === type);

  const updateRating = (id: number, type: "movie" | "tv", rating: number) => {
    setWatched((prev) =>
      prev.map((i) => (i.id === id && i.type === type ? { ...i, rating } : i))
    );
  };

  return (
    <WatchlistContext.Provider
      value={{
        items, add, remove, isInWatchlist, toggle,
        watched, markWatched, removeWatched, isWatched, getWatchedItem, updateRating,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
