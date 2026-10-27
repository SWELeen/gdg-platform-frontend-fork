import type { BadgeTheme, CommitteeCode } from "./types";

// Badge colours per committee, keyed by the backend's committee codes.

const pattern = "/badge/gdg-pattern.png";

// Web Development's blue badge.
const webDevelopment: BadgeTheme = {
  bg: "#4285F4",
  ink: "#ffffff",
  photoBg: "#ffffff",
  photoFrame: "#5f6368",
  patternBg: "#f1f3f4",
  patternUrl: pattern,
  strap: "#fafafa",
  stitch: "rgba(60, 64, 67, 0.28)",
};

/** Also used by the placeholder card when the profile data doesn't match. */
export const defaultTheme = webDevelopment;

export const clubLeadershipTheme: BadgeTheme = {
  ...webDevelopment,
  bg: "#4285F4",
  backgroundColors: ["#4285F4", "#34A853", "#FBBC04", "#EA4335"],
  strap: "#ffffff",
};

export const developerLeadershipTheme: BadgeTheme = {
  ...webDevelopment,
  bg: "#174EA6",
};

// a card in one solid colour; light colours need dark ink
const solid = (bg: string, ink: string): BadgeTheme => ({
  ...webDevelopment,
  bg,
  ink,
  photoFrame: ink === "#ffffff" ? "rgba(255, 255, 255, 0.9)" : "rgba(32, 33, 36, 0.55)",
});

export const committees: Record<CommitteeCode, { shortName: string; theme: BadgeTheme }> = {
  WEB: { shortName: "Web Development", theme: webDevelopment },

  // ── DEVELOPER COMMITTEE COLOURS ─────────────────────────────
  // TODO: this is where the developer committees' colours go. just swap
  // `webDevelopment` on a committee's line for something like
  // solid("#0b8043", "#ffffff") (background, then text colour)
  DATA: { shortName: "Data Analysis", theme: solid("#34A853", "#ffffff") },
  CYBER: { shortName: "Cybersecurity", theme: solid("#EA4335", "#ffffff") },
  AI: { shortName: "AIML", theme: solid("#9334E6", "#ffffff") },
  AUTOMATION: { shortName: "Automation", theme: solid("#00ACC1", "#ffffff") },
  ROBOTICS: { shortName: "IoT & Robotics", theme: solid("#FB8C00", "#202124") },

  // ── Regular committees: one Google colour each ──────────────
  PR: { shortName: "Public Relations", theme: solid("#0F9D58", "#ffffff") },
  // Google yellow is too light for white text, so its card takes dark ink
  CONTENT: { shortName: "Content Writing", theme: solid("#F9AB00", "#202124") },
  PM: { shortName: "Project Management", theme: solid("#1A73E8", "#ffffff") },
  DMD: { shortName: "Digital Media & Design", theme: solid("#D93025", "#ffffff") },
};
