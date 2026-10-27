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

export type CommitteeRole = "Member" | "Co-Leader" | "Leader";

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
  role: CommitteeRole;
  /** The committee's short name, e.g. "Web Development". */
  committee: string;
  chapter: string;
  university: string;
  /** The member's uploaded photo; without one the card shows a silhouette. */
  photoUrl: string | null;
};
