"use client";
import Image from "next/image";
import { STREAMING_PROVIDERS, IMAGE_BASE } from "@/lib/tmdb";

interface ProviderFilterProps {
  selected: number[];
  onToggle: (id: number) => void;
}

export default function ProviderFilter({ selected, onToggle }: ProviderFilterProps) {
  return (
    <div className="provider-filter">
      <p className="provider-filter-title">Filter by Streaming Service</p>
      <div className="provider-grid">
        {STREAMING_PROVIDERS.map((provider) => {
          const isActive = selected.includes(provider.id);
          return (
            <button
              key={provider.id}
              className={`provider-btn ${isActive ? "active" : ""}`}
              onClick={() => onToggle(provider.id)}
              id={`provider-filter-${provider.id}`}
              aria-pressed={isActive}
            >
              <span style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: provider.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "0.6rem",
                fontWeight: 800,
                color: provider.color === "#FFD600" ? "#000" : "#fff",
              }}>
                {provider.shortName.slice(0, 1)}
              </span>
              {provider.shortName}
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            className="filter-chip"
            onClick={() => selected.forEach((id) => onToggle(id))}
            id="provider-filter-clear"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
