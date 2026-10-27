import type { Membership } from "@/lib/badge/types";
import type { ProfileSeed } from "@/lib/useProfileEditor";

// TEMPORARY: the member shown on /profile until the authenticated profile API
// exists. Email, phone and student ID are placeholders.
export const demoMemberProfile: ProfileSeed = {
  profile: {
    initials: "SA",
    name: "Shumokh Alsharif",
    email: "shumokh@example.com",
  },
  bio: "I build for the web, mostly in the messy middle where frontend meets backend, and I care about how things feel as much as how they work.",
  avatarUrl: null,
  headerImageUrl: null,
  personalInfo: {
    id: "personal",
    rows: [
      { key: "fullName", value: "Shumokh Alsharif" },
      { key: "email", value: "shumokh@example.com" },
      { key: "phone", value: "500000000" },
      { key: "studentId", value: "2300000" },
    ],
  },
  academicInfo: {
    id: "academic",
    rows: [
      { key: "university", value: "University of Jeddah" },
      { key: "major", value: "Software Engineering" },
      { key: "academicYear", value: "Fourth Year" },
    ],
  },
  socialLinks: [
    { platform: "github", value: "https://github.com/mukhaverse" },
    { platform: "linkedin", value: "https://www.linkedin.com/in/shumokh-alsharif-903361364" },
    { platform: "website", value: "https://shumokh.dev" },
  ],
};

// The demo member's committee and role, which decide the badge. Try any
// committee id from lib/badge/themes.ts and any role ("Member", "Co-Leader",
// "Leader"); set it to null to see the profile of someone without a committee.
export const demoMembership: Membership | null = {
  committeeId: "web-development",
  role: "Member",
};
