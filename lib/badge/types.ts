export type CommitteeId =
  | "web-development"
  | "data-analysis"
  | "cybersecurity"
  | "artificial-intelligence"
  | "automation"
  | "robotics-iot"
  | "public-relations"
  | "content-writing"
  | "project-management"
  | "digital-media";

export const committeeRoles = ["Member", "Co-Leader", "Leader"] as const;
export type CommitteeRole = (typeof committeeRoles)[number];

/** Same values as the signup form's gender field (data/signup.ts). */
export type Gender = "female" | "male";

/** A member's place in a committee, which decides their badge. */
export type Membership = {
  committeeId: CommitteeId;
  role: CommitteeRole;
};

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
