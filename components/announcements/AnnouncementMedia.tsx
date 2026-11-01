import Image from "next/image";
import type { CSSProperties } from "react";
import type {
  AnnouncementArtwork,
  AnnouncementMedia as AnnouncementMediaData,
} from "@/lib/announcements/types";

type Orb = { color: string; x: number; y: number; size: number };

// Abstract GDG-coloured artwork (blurred brand-colour orbs on a tinted base) that
// stands in for announcement imagery. Orbs are placed physically on purpose: the
// artwork is a picture, not text, so it does not mirror with reading direction.
const artworks: Record<AnnouncementArtwork, { base: string; orbs: Orb[] }> = {
  navy: {
    base: "var(--gdg-blue)",
    orbs: [
      { color: "color-mix(in srgb, var(--gdg-blue) 60%, var(--white))", x: -8, y: -30, size: 48 },
      { color: "var(--gdg-yellow)", x: 64, y: -2, size: 34 },
      { color: "var(--gdg-green)", x: 18, y: 58, size: 42 },
    ],
  },
  forest: {
    base: "var(--gdg-green)",
    orbs: [
      { color: "color-mix(in srgb, var(--gdg-blue) 60%, var(--white))", x: 6, y: 42, size: 38 },
      { color: "var(--gdg-red)", x: 66, y: -18, size: 32 },
    ],
  },
  plum: {
    base: "color-mix(in srgb, var(--gdg-blue) 45%, var(--gdg-red))",
    orbs: [
      { color: "var(--gdg-yellow)", x: 4, y: -26, size: 40 },
      { color: "var(--gdg-blue)", x: 62, y: 44, size: 36 },
    ],
  },
  ocean: {
    base: "var(--gdg-blue)",
    orbs: [
      { color: "var(--gdg-green)", x: 56, y: -24, size: 36 },
      { color: "var(--gdg-red)", x: 0, y: 48, size: 40 },
    ],
  },
  ember: {
    base: "var(--gdg-red)",
    orbs: [
      { color: "var(--gdg-red)", x: -6, y: -22, size: 38 },
      { color: "var(--gdg-yellow)", x: 58, y: 34, size: 40 },
    ],
  },
  pine: {
    base: "var(--gdg-green)",
    orbs: [
      { color: "var(--gdg-yellow)", x: 34, y: -26, size: 34 },
      { color: "var(--gdg-red)", x: 58, y: 40, size: 38 },
    ],
  },
};

type AnnouncementMediaProps = {
  media: AnnouncementMediaData;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function AnnouncementMedia({
  media,
  className = "",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: AnnouncementMediaProps) {
  if (media.type === "image") {
    return (
      <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          unoptimized
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const { base, orbs } = artworks[media.artwork];

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden [container-type:inline-size] ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${base} 32%, var(--gdg-dark))` }}
    >
      {orbs.map((orb) => (
        <span
          key={`${orb.color}-${orb.x}-${orb.y}`}
          className="absolute aspect-square rounded-full opacity-90 blur-[2.5cqi]"
          style={
            {
              backgroundColor: orb.color,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}%`,
            } satisfies CSSProperties
          }
        />
      ))}
      <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.035)_0_2px,transparent_2px_16px)]" />
    </div>
  );
}
