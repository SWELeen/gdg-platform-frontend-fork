"use client";

import { SN_Pro } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { createBadgeEngine } from "@/lib/badge/engine";
import { CARD_H, CARD_W, loadBadgeAssets, paintBack, paintFront } from "@/lib/badge/paint";
import type { BadgeData, BadgeTheme } from "@/lib/badge/types";

// The badge card's own typeface, from the original GDG card design.
const snPro = SN_Pro({ subsets: ["latin"] });

type Fit = { fit: number; fitW: number };

function resolveThemeColor(value: string) {
  const styles = getComputedStyle(document.documentElement);
  return value.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g, (_match, name: string, fallback?: string) =>
    styles.getPropertyValue(name).trim() || fallback || "transparent",
  );
}

function resolveBadgeTheme(theme: BadgeTheme): BadgeTheme {
  return {
    ...theme,
    bg: resolveThemeColor(theme.bg),
    ink: resolveThemeColor(theme.ink),
    photoBg: resolveThemeColor(theme.photoBg),
    photoFrame: resolveThemeColor(theme.photoFrame),
    patternBg: resolveThemeColor(theme.patternBg),
    strap: resolveThemeColor(theme.strap),
    stitch: resolveThemeColor(theme.stitch),
    backgroundColors: theme.backgroundColors?.map(resolveThemeColor),
  };
}

type HangingBadgeProps = {
  data: BadgeData;
  theme: BadgeTheme;
  /** Spoken in place of the card, which is drawn on a canvas. */
  label: string;
  /** Sizes and places the column the card hangs in. */
  className?: string;
  /** Where the canvas reaches relative to the column; the straps start at its top edge. */
  stageClassName?: string;
  /** Stretch the canvas across the viewport width, so the card can be thrown over the page. */
  spanViewport?: boolean;
  desktop?: Fit;
  phone?: Fit;
};

// Pass memoised `data` and `theme`: a new object rebuilds the 3D scene.
export function HangingBadge({
  data,
  theme,
  label,
  className = "",
  stageClassName = "inset-0",
  spanViewport = false,
  desktop = { fit: 0.7, fitW: 0.8 },
  phone = { fit: 0.78, fitW: 0.7 },
}: HangingBadgeProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLCanvasElement>(null);
  const [flat, setFlat] = useState(false);

  useEffect(() => {
    const stage = stageRef.current, column = columnRef.current;
    if (!stage || !column) return;
    let cancelled = false;
    let engine: Awaited<ReturnType<typeof createBadgeEngine>> = null;

    (async () => {
      const canvasTheme = resolveBadgeTheme(theme);
      const assets = await loadBadgeAssets(data, canvasTheme, snPro.style.fontFamily);
      if (cancelled) return;
      const light = window.matchMedia("(max-width: 767px)").matches;
      engine = await createBadgeEngine(
        stage,
        column,
        {
          paintFront: (cv) => paintFront(cv, data, canvasTheme, assets),
          paintBack: (cv) => paintBack(cv, data, canvasTheme, assets),
          edge: canvasTheme.bg,
          strap: canvasTheme.strap,
          stitch: canvasTheme.stitch,
        },
        { ...(light ? phone : desktop), light, spanViewport },
      );
      if (cancelled) {
        engine?.destroy();
        return;
      }
      if (!engine) {
        setFlat(true);
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) engine.show();
      else engine.drop();
    })();

    return () => {
      cancelled = true;
      engine?.destroy();
    };
    // `desktop`, `phone` and `spanViewport` are read once, when the scene is built
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, theme]);

  // no WebGL: the same card, painted flat
  useEffect(() => {
    const cv = flatRef.current;
    if (!flat || !cv) return;
    let cancelled = false;
    const canvasTheme = resolveBadgeTheme(theme);
    loadBadgeAssets(data, canvasTheme, snPro.style.fontFamily).then((assets) => {
      if (cancelled) return;
      const width = Math.round(cv.clientWidth * Math.min(window.devicePixelRatio || 1, 3));
      cv.width = width;
      cv.height = Math.round((width * CARD_H) / CARD_W);
      paintFront(cv, data, canvasTheme, assets);
    });
    return () => {
      cancelled = true;
    };
  }, [flat, data, theme]);

  return (
    <div ref={columnRef} role="img" aria-label={label} className={`relative ${snPro.className} ${className}`}>
      <div ref={stageRef} aria-hidden="true" className={`pointer-events-none absolute z-20 ${stageClassName}`} />
      {flat && (
        <canvas
          ref={flatRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 mx-auto block aspect-300/441 h-auto w-[min(17rem,70%)] -translate-y-1/2 drop-shadow-xl"
        />
      )}
    </div>
  );
}
