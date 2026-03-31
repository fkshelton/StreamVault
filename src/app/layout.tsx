import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { WatchlistProvider } from "@/lib/watchlist-context";

export const metadata: Metadata = {
  title: {
    default: "StreamVault — Find Where to Watch Movies & TV Shows",
    template: "%s | StreamVault",
  },
  description:
    "Discover movies and TV shows, find where to stream, rent, or buy them across Netflix, Disney+, Hulu, Prime Video, and more.",
  keywords: ["streaming", "movies", "tv shows", "netflix", "disney+", "hulu", "where to watch", "streaming guide"],
  openGraph: {
    siteName: "StreamVault",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WatchlistProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <div className="page-container">
              <p>
                Data provided by{" "}
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
                  TMDB
                </a>
                . This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </footer>
        </WatchlistProvider>
      </body>
    </html>
  );
}
