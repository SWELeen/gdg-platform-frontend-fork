import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { AnnouncementCategory } from "@/lib/announcements/types";

// Light mode: pastel background (approved design). Text uses the --dashboard-*-text
// tokens, which globals.css already swaps to brighter values in dark mode.
// `tint` is the brand colour used only by the dark-mode background/ring below.
const categoryTones: Record<AnnouncementCategory, { classes: string; tint: string }> = {
  events: {
    classes: "bg-gdg-green-light/60 text-[var(--dashboard-green-text)]",
    tint: "var(--gdg-green)",
  },
  recruitment: {
    classes: "bg-gdg-pink-light/70 text-[var(--dashboard-red-text)]",
    tint: "var(--gdg-red)",
  },
  workshops: {
    classes: "bg-gdg-pink-light/70 text-[var(--dashboard-red-text)]",
    tint: "var(--gdg-red)",
  },
  results: {
    classes: "bg-gdg-yellow-light/70 text-[var(--dashboard-yellow-text)]",
    tint: "var(--gdg-yellow)",
  },
  community: {
    classes: "bg-gdg-blue-light/60 text-[var(--dashboard-blue-text)]",
    tint: "var(--gdg-blue)",
  },
  trip: {
    classes: "bg-gdg-green-light/60 text-[var(--dashboard-green-text)]",
    tint: "var(--gdg-green)",
  },
};

// Dark mode only, matching the theme selectors in globals.css: a manual
// data-theme="dark", or the system preference when no theme was chosen.
// Translucent category tint + inset ring (box-shadow, so no size change vs light).
const darkModeTone = [
  "[html[data-theme=dark]_&]:bg-[color-mix(in_srgb,var(--badge-tint)_20%,transparent)]",
  "[html[data-theme=dark]_&]:ring-1",
  "[html[data-theme=dark]_&]:ring-inset",
  "[html[data-theme=dark]_&]:ring-[color-mix(in_srgb,var(--badge-tint)_45%,transparent)]",
  "dark:[html:not([data-theme])_&]:bg-[color-mix(in_srgb,var(--badge-tint)_20%,transparent)]",
  "dark:[html:not([data-theme])_&]:ring-1",
  "dark:[html:not([data-theme])_&]:ring-inset",
  "dark:[html:not([data-theme])_&]:ring-[color-mix(in_srgb,var(--badge-tint)_45%,transparent)]",
].join(" ");

export function CategoryBadge({ category }: { category: AnnouncementCategory }) {
  const t = useTranslations("announcements.categories");
  const tone = categoryTones[category];

  return (
    <span
      style={{ "--badge-tint": tone.tint } as CSSProperties}
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-none ${tone.classes} ${darkModeTone}`}
    >
      {t(category)}
    </span>
  );
}
