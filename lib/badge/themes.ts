import type { BadgeTheme, CommitteeId } from "./types";

// Badge colours per committee. Ids match the committees in data/home.ts.

const pattern = "/badge/gdg-pattern.png";

// The default card: Web Development's dark slate GDG member card.
const webDevelopment: BadgeTheme = {
  bg: "#1e2a34",
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

// a card in one solid colour; light colours need dark ink
const solid = (bg: string, ink: string): BadgeTheme => ({
  ...webDevelopment,
  bg,
  ink,
  photoFrame: ink === "#ffffff" ? "rgba(255, 255, 255, 0.9)" : "rgba(32, 33, 36, 0.55)",
});

export const committees: Record<CommitteeId, { shortName: string; theme: BadgeTheme }> = {
  "web-development": { shortName: "Web Development", theme: webDevelopment },

  // ── DEVELOPER COMMITTEE COLOURS ─────────────────────────────
  // TODO: this is where the developer committees' colours go. just swap
  // `webDevelopment` on a committee's line for something like
  // solid("#0b8043", "#ffffff") (background, then text colour)
  "data-analysis": { shortName: "Data Analysis", theme: webDevelopment },
  cybersecurity: { shortName: "Cybersecurity", theme: webDevelopment },
  "artificial-intelligence": { shortName: "AIML", theme: webDevelopment },
  automation: { shortName: "Automation", theme: webDevelopment },
  "robotics-iot": { shortName: "IoT & Robotics", theme: webDevelopment },

  // ── Regular committees: one Google colour each ──────────────
  "public-relations": { shortName: "Public Relations", theme: solid("#34a853", "#ffffff") },
  // Google yellow is too light for white text, so its card takes dark ink
  "content-writing": { shortName: "Content Writing", theme: solid("#fbbc04", "#202124") },
  "project-management": { shortName: "Project Management", theme: solid("#4285f4", "#ffffff") },
  "digital-media": { shortName: "Digital Media & Design", theme: solid("#ea4335", "#ffffff") },
};
