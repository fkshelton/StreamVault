"use client";
import { useState } from "react";
import type { TMDBVideo } from "@/lib/tmdb";

interface TrailerSectionProps {
  videos: TMDBVideo[];
}

export default function TrailerSection({ videos }: TrailerSectionProps) {
  const trailers = videos
    .filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    .sort((a, b) => {
      // Prefer official trailers first, then teasers
      if (a.type === "Trailer" && b.type !== "Trailer") return -1;
      if (a.type !== "Trailer" && b.type === "Trailer") return 1;
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;
      return 0;
    });

  const [activeIdx, setActiveIdx] = useState(0);

  if (trailers.length === 0) return null;

  const active = trailers[activeIdx];

  return (
    <div className="trailer-section" style={{ marginTop: "var(--space-2xl)" }}>
      <h2 className="section-title">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        {" "}Trailers & Videos
      </h2>

      <div className="trailer-embed">
        <iframe
          src={`https://www.youtube.com/embed/${active.key}?rel=0&modestbranding=1`}
          title={active.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="trailer-iframe"
        />
      </div>

      {trailers.length > 1 && (
        <div className="trailer-tabs">
          {trailers.slice(0, 5).map((v, i) => (
            <button
              key={v.id}
              className={`trailer-tab ${i === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {v.type === "Trailer" ? `Trailer${trailers.filter(t => t.type === "Trailer").indexOf(v) > 0 ? ` ${trailers.filter(t => t.type === "Trailer").indexOf(v) + 1}` : ""}` : v.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
