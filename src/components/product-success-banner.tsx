"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type ProductSuccessBannerProps = {
  mode: "created" | "saved" | "asset";
};

const bannerCopy = {
  created: {
    title: "Product added successfully",
    detail: "Your new product is live in the hub and ready for the next update.",
  },
  saved: {
    title: "Changes saved",
    detail: "The latest product details are now updated.",
  },
  asset: {
    title: "Asset added",
    detail: "The new asset is now attached to this product.",
  },
} satisfies Record<ProductSuccessBannerProps["mode"], { title: string; detail: string }>;

export function ProductSuccessBanner({ mode }: ProductSuccessBannerProps) {
  const [showConfetti, setShowConfetti] = useState(mode === "created");
  const pieces = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${6 + ((index * 89) % 88)}%`,
        delay: `${(index % 6) * 70}ms`,
        duration: `${1900 + (index % 5) * 160}ms`,
      })),
    [],
  );

  useEffect(() => {
    if (mode !== "created") {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const timeout = window.setTimeout(() => {
      setShowConfetti(false);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [mode]);

  return (
    <div className="ld-success-wrap">
      {showConfetti ? (
        <div className="ld-confetti-burst" aria-hidden="true">
          {pieces.map((piece) => (
            <span
              key={piece.id}
              className="ld-confetti-piece"
              style={
                {
                  left: piece.left,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      <div className="ld-success-banner">
        <span className="ld-success-icon">
          {mode === "created" ? <Sparkles className="size-4" /> : <CheckCircle2 className="size-4" />}
        </span>
        <div className="min-w-0">
          <div className="ld-success-title">{bannerCopy[mode].title}</div>
          <div className="ld-success-copy">{bannerCopy[mode].detail}</div>
        </div>
      </div>
    </div>
  );
}
