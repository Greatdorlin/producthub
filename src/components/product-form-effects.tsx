"use client";

import { useEffect } from "react";

type ProductFormEffectsProps = {
  focusTargetId: string;
};

export function ProductFormEffects({ focusTargetId }: ProductFormEffectsProps) {
  useEffect(() => {
    if (window.location.hash !== "#create-product") {
      return;
    }

    const target = document.getElementById(focusTargetId) as HTMLInputElement | null;

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus();
    });
  }, [focusTargetId]);

  return null;
}
