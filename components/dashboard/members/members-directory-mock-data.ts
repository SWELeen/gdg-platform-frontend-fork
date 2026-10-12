// MOCK DATA — demonstration only. There is no approved members-directory API contract yet
// (see docs/api-integration.md). The team-based filtering done from this data in the UI is NOT
// access control; the backend must decide which members the logged-in user may see.

export interface DirectoryMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  teamId: string;
  team: string;
}

/** Mock reference for the logged-in user's team; matches `currentUser.role` in ../mock-data.ts. */
export const mockCurrentTeamId = "web";

export const directoryMembers: DirectoryMember[] = [
  { id: "m-1", name: "Leen Kharraz", initials: "LK", role: "Frontend Developer", teamId: "web", team: "Web Development" },
  { id: "m-2", name: "Omar Haddad", initials: "OH", role: "Team Lead", teamId: "web", team: "Web Development" },
  { id: "m-3", name: "Sara Nasser", initials: "SN", role: "Backend Developer", teamId: "web", team: "Web Development" },
  { id: "m-4", name: "Yazan Khalil", initials: "YK", role: "UI Engineer", teamId: "web", team: "Web Development" },
  { id: "m-5", name: "Dana Mansour", initials: "DM", role: "Mobile Developer", teamId: "mobile", team: "Mobile Development" },
  { id: "m-6", name: "Khaled Abbas", initials: "KA", role: "Team Lead", teamId: "mobile", team: "Mobile Development" },
  { id: "m-7", name: "Rana Saleh", initials: "RS", role: "Flutter Developer", teamId: "mobile", team: "Mobile Development" },
  { id: "m-8", name: "Tariq Younes", initials: "TY", role: "Data Analyst", teamId: "data", team: "Data Analysis" },
  { id: "m-9", name: "Hala Ibrahim", initials: "HI", role: "ML Engineer", teamId: "data", team: "Data Analysis" },
  { id: "m-10", name: "Noor Awad", initials: "NA", role: "Product Designer", teamId: "design", team: "UI/UX Design" },
  { id: "m-11", name: "Ziad Farouk", initials: "ZF", role: "Visual Designer", teamId: "design", team: "UI/UX Design" },
  { id: "m-12", name: "Maya Darwish", initials: "MD", role: "PR Coordinator", teamId: "pr", team: "Public Relations" },
];
