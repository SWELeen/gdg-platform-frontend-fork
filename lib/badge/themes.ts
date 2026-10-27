import type { BadgeTheme, CommitteeId } from "./types";

// Badge colours per committee. Ids match the committees in data/home.ts.

const pattern = "/badge/gdg-pattern.png";

// TEMPORARY: the developer committees' own colours aren't decided yet, so they
// all use the GDG on Campus member card (dark slate) for now.
const developers: BadgeTheme = {
  bg: "#1e2a34",
  ink: "#ffffff",
  photoBg: "#ffffff",
  photoFrame: "#5f6368",
  patternBg: "#f1f3f4",
  patternUrl: pattern,
  strap: "#fafafa",
  stitch: "rgba(60, 64, 67, 0.28)",
};

// the regular committees each take one Google colour
const google = (bg: string, ink: string): BadgeTheme => ({
  ...developers,
  bg,
  ink,
  photoFrame: ink === "#ffffff" ? "rgba(255, 255, 255, 0.9)" : "rgba(32, 33, 36, 0.55)",
});

export const committees: Record<CommitteeId, { shortName: string; theme: BadgeTheme }> = {
  "web-development": { shortName: "Web Development", theme: developers },
  "data-analysis": { shortName: "Data Analysis", theme: developers },
  cybersecurity: { shortName: "Cybersecurity", theme: developers },
  "artificial-intelligence": { shortName: "AIML", theme: developers },
  automation: { shortName: "Automation", theme: developers },
  "robotics-iot": { shortName: "IoT & Robotics", theme: developers },
  "public-relations": { shortName: "Public Relations", theme: google("#34a853", "#ffffff") },
  // Google yellow is too light for white text, so its card takes dark ink
  "content-writing": { shortName: "Content Writing", theme: google("#fbbc04", "#202124") },
  "project-management": { shortName: "Project Management", theme: google("#4285f4", "#ffffff") },
  "digital-media": { shortName: "Digital Media & Design", theme: google("#ea4335", "#ffffff") },
};
