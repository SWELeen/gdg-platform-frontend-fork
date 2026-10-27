/** The backend's committee codes, as returned by /me (see committeeCode in components/dashboard/shared/committee-config.ts). */
export type CommitteeCode = "WEB" | "DATA" | "CYBER" | "AI" | "AUTOMATION" | "ROBOTICS" | "PR" | "CONTENT" | "PM" | "DMD";

/** The committee positions /me returns that have a badge, lowest first. */
export const committeeRoles = ["Member", "Co-Leader", "Leader"] as const;
export type CommitteeRole = (typeof committeeRoles)[number];

export type Gender = "female" | "male";

/** Colours for one committee's badge; see themes.ts. */
export type BadgeTheme = {
  bg: string;
  ink: string;
  photoBg: string;
  photoFrame: string;
  /** Shown behind the pattern image while it loads, or if it fails. */
  patternBg: string;
  patternUrl: string | null;
  strap: string;
  stitch: string;
};

/** What a member's badge shows. Built from profile data, never fetched on its own. */
export type BadgeData = {
  name: string;
  /** A CommitteeRole, or "Role" on the placeholder card. */
  role: string;
  /** The committee's short name, e.g. "Web Development". */
  committee: string;
  chapter: string;
  university: string;
  /** The member's uploaded photo; without one the card shows a silhouette. */
  photoUrl: string | null;
  /** Picks the silhouette when there's no photo. */
  gender: Gender;
};
