import type { BadgeTheme, CommitteeCode } from "./types";

// Badge colours per committee, keyed by the backend's committee codes.

const pattern = "/badge/gdg-pattern.png";

// Common badge surfaces; all colour values come from CSS custom properties.
const badgeBase: BadgeTheme = {
  bg: "var(--committee-web-development)",
  ink: "var(--badge-ink-light)",
  photoBg: "var(--badge-photo-bg)",
  photoFrame: "var(--badge-photo-frame)",
  patternBg: "var(--badge-pattern-bg)",
  patternUrl: pattern,
  strap: "var(--badge-strap)",
  stitch: "var(--badge-stitch)",
};

/** Also used by the placeholder card when the profile data doesn't match. */
export const defaultTheme = badgeBase;

export const clubLeadershipTheme: BadgeTheme = {
  ...badgeBase,
  bg: "var(--gdg-blue)",
  backgroundColors: ["var(--gdg-blue)", "var(--gdg-green)", "var(--gdg-yellow)", "var(--gdg-red)"],
  strap: "var(--badge-ink-light)",
};

export const developerLeadershipTheme: BadgeTheme = {
  ...badgeBase,
  bg: "var(--committee-developers)",
};

// a card in one solid colour; light colours need dark ink
const solid = (bg: string, ink: string): BadgeTheme => ({
  ...badgeBase,
  bg,
  ink,
  photoFrame: ink === "var(--badge-ink-light)"
    ? "var(--badge-photo-frame-light)"
    : "var(--badge-photo-frame-dark)",
});

export const committees: Record<CommitteeCode, { shortName: string; theme: BadgeTheme }> = {
  WEB: { shortName: "Web Development", theme: solid("var(--committee-web-development)", "var(--badge-ink-light)") },

  // ── DEVELOPER COMMITTEE COLOURS ─────────────────────────────
  // Developer committee colours are shared with the dashboard through globals.css.
  DATA: { shortName: "Data Analysis", theme: solid("var(--committee-data-analysis)", "var(--badge-ink-light)") },
  CYBER: { shortName: "Cybersecurity", theme: solid("var(--committee-cybersecurity)", "var(--badge-ink-light)") },
  AI: { shortName: "AIML", theme: solid("var(--committee-artificial-intelligence)", "var(--badge-ink-light)") },
  AUTOMATION: { shortName: "Automation", theme: solid("var(--committee-automation)", "var(--badge-ink-light)") },
  ROBOTICS: { shortName: "IoT & Robotics", theme: solid("var(--committee-robotics-iot)", "var(--badge-ink-light)") },

  // ── Regular committees: one Google colour each ──────────────
  PR: { shortName: "Public Relations", theme: solid("var(--committee-public-relations)", "var(--badge-ink-light)") },
  // Google yellow uses dark ink for readable contrast.
  CONTENT: { shortName: "Content Writing", theme: solid("var(--committee-content-writing)", "var(--badge-ink-dark)") },
  PM: { shortName: "Project Management", theme: solid("var(--committee-project-management)", "var(--badge-ink-light)") },
  DMD: { shortName: "Digital Media & Design", theme: solid("var(--committee-digital-media-design)", "var(--badge-ink-light)") },
};
