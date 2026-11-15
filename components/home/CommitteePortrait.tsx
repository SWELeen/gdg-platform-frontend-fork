"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const FALLBACK_IMAGE = "/images/unknown.png";

// Measured source-image geometry: [native width, native height, alpha x, y, width, height].
// These describe transparent padding, not person-specific display sizes or scales.
const portraitGeometry: Record<string, readonly [number, number, number, number, number, number]> = {
  "/images/PM-colead.png": [1228, 1700, 0, 11, 1228, 1689],
  "/images/PM-Lead.png": [1408, 1756, 0, 19, 1408, 1737],
  "/images/unknown.png": [364, 420, 1, 61, 363, 359],
  "/images/sameerah-preview.png": [408, 612, 0, 59, 408, 553],
  "/images/DMD-colead.png": [1552, 2184, 0, 68, 1552, 2116],
  "/images/PR-colead.png": [1356, 1444, 0, 19, 1356, 1425],
};
const reference = portraitGeometry["/images/PM-colead.png"];

export default function CommitteePortrait({
  image,
  isLeader,
  open,
  highlighted,
  reduceMotion,
  horizontal,
  sizeRatio,
}: {
  image?: string;
  isLeader: boolean;
  open: boolean;
  highlighted: boolean;
  reduceMotion: boolean | null;
  horizontal?: boolean;
  sizeRatio: number;
}) {
  const portraitRef = useRef<SVGSVGElement>(null);
  // SVG image elements have no native lazy loading. Keep hidden layouts from
  // fetching full-size portraits, and start visible ones before they scroll in.
  const nearViewport = useInView(portraitRef, { once: true, margin: "400px" });
  const requestedSource = image?.trim() || FALLBACK_IMAGE;
  const [failure, setFailure] = useState<{ requestedSource: string; fallbackFailed: boolean }>();
  const currentFailure = failure?.requestedSource === requestedSource ? failure : undefined;
  const source = currentFailure ? FALLBACK_IMAGE : requestedSource;
  const geometry = portraitGeometry[source];
  const viewBox = geometry
    // Keep the PM co-leader's relative headroom for every visible person.
    ? `${geometry[2]} ${geometry[3] - geometry[5] * reference[3] / reference[5]} ${geometry[4]} ${geometry[5] * reference[1] / reference[5]}`
    : undefined;

  return (
    <motion.svg
      ref={portraitRef}
      aria-hidden="true"
      className={`absolute inset-x-0 bottom-0 mx-auto h-full w-auto max-w-none overflow-visible md:h-3/5 ${currentFailure?.fallbackFailed ? "invisible" : ""}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMax meet"
      initial={false}
      animate={{
        ...(horizontal === undefined ? {} : { height: `${(horizontal ? 3 / 5 : 1) * sizeRatio * 100}%` }),
        [isLeader ? "left" : "right"]: open ? "100%" : "0%",
        x: open ? (isLeader ? "-100%" : "100%") : "0%",
        scale: reduceMotion || highlighted ? 1 : 1.035,
        filter: open
          ? "none"
          : highlighted
            ? "grayscale(0) brightness(.85)"
            : "grayscale(1) brightness(.55) sepia(.2) hue-rotate(155deg)",
      }}
      transition={{
        default: { duration: reduceMotion ? 0 : 0.75, ease: [0.22, 0.68, 0, 1] },
        scale: { duration: reduceMotion ? 0 : 0.9, ease: [0.22, 0.68, 0, 1] },
        filter: { duration: reduceMotion ? 0 : 0.5, ease: "easeOut" },
      }}
    >
      <image
        key={source}
        href={nearViewport ? source : undefined}
        width={geometry?.[0]}
        height={geometry?.[1]}
        onLoad={(event) => {
          if (source === requestedSource) setFailure(undefined);
          // New assets still render with their intrinsic bounds; no pixel scanning.
          if (!geometry) {
            const bounds = event.currentTarget.getBBox();
            if (bounds.width > 0 && bounds.height > 0) {
              event.currentTarget.ownerSVGElement?.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
            }
          }
        }}
        onError={() => setFailure({ requestedSource, fallbackFailed: source === FALLBACK_IMAGE })}
      />
    </motion.svg>
  );
}
