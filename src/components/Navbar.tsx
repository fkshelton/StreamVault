"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useWatchlist } from "@/lib/watchlist-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useWatchlist();

  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" onClick={closeMenu}>
          StreamVault
        </Link>

        <div className="navbar-nav">
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link href="/movies" className={`nav-link ${pathname.startsWith("/movies") ? "active" : ""}`}>
            Movies
          </Link>
          <Link href="/tv" className={`nav-link ${pathname.startsWith("/tv") ? "active" : ""}`}>
            TV Shows
          </Link>
          <Link href="/roulette" className={`nav-link nav-link-accent ${pathname === "/roulette" ? "active" : ""}`}>
            🎰 Roulette
          </Link>
        </div>

        <form onSubmit={handleSearch} className="navbar-search">
          <span className="navbar-search-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            id="navbar-search-input"
            className="navbar-search-input"
            type="search"
            placeholder="Search movies, shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </form>

        <div className="navbar-actions">
          <Link href="/watchlist" className="icon-btn" title="My Watchlist" id="watchlist-nav-btn" onClick={closeMenu}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {items.length > 0 && (
              <span className="watchlist-count">{items.length > 99 ? "99+" : items.length}</span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="mobile-menu animate-fade-in">
          <Link href="/" className={`mobile-menu-link ${pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
          <Link href="/movies" className={`mobile-menu-link ${pathname.startsWith("/movies") ? "active" : ""}`} onClick={closeMenu}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
            </svg>
            Movies
          </Link>
          <Link href="/tv" className={`mobile-menu-link ${pathname.startsWith("/tv") ? "active" : ""}`} onClick={closeMenu}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="m8 21 4-4 4 4" /><path d="M12 17v4" />
            </svg>
            TV Shows
          </Link>
          <Link href="/roulette" className={`mobile-menu-link mobile-menu-accent ${pathname === "/roulette" ? "active" : ""}`} onClick={closeMenu}>
            🎰 Roulette
          </Link>
          <Link href="/watchlist" className={`mobile-menu-link ${pathname === "/watchlist" ? "active" : ""}`} onClick={closeMenu}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            My Library
          </Link>
        </div>
      )}
    </nav>
  );
}
