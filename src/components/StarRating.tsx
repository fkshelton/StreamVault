"use client";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ rating, onRate, size = 20, readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const stars = [1, 2, 3, 4, 5];
  const display = hovered || rating;

  return (
    <div
      className="star-rating"
      style={{ display: "inline-flex", gap: 2 }}
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {stars.map((star) => {
        const filled = display >= star;
        const halfFilled = !filled && display >= star - 0.5;

        return (
          <span
            key={star}
            style={{
              cursor: readonly ? "default" : "pointer",
              position: "relative",
              width: size,
              height: size,
              display: "inline-block",
            }}
            onMouseMove={(e) => {
              if (readonly) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isLeft = e.clientX - rect.left < rect.width / 2;
              setHovered(isLeft ? star - 0.5 : star);
            }}
            onClick={() => {
              if (readonly || !onRate) return;
              onRate(hovered || star);
            }}
          >
            {/* Background star (empty) */}
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>

            {/* Filled star */}
            {(filled || halfFilled) && (
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="#fbbf24"
                stroke="#fbbf24"
                strokeWidth="1"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  clipPath: halfFilled ? "inset(0 50% 0 0)" : undefined,
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </span>
        );
      })}
      {rating > 0 && (
        <span style={{ marginLeft: 6, fontSize: size * 0.7, color: "#fbbf24", fontWeight: 600, alignSelf: "center" }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
