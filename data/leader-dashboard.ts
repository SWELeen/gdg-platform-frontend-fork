import type { LeaderCommittee } from "@/components/dashboard/shared/types";

interface CommitteeDashboardMock {
  name: string;
  description: string;
  headerSubtitle: string;
  leaderDisplayName: string;
  coLeaderDisplayName: string;
  leaderRoleDescription: string;
  coLeaderRoleDescription: string;
  settings: {
    notifyOnSubmission: boolean;
    autoApproveMembers: boolean;
  };
}

export const leaderDashboardMockData: Record<LeaderCommittee, CommitteeDashboardMock> = {
  "data-analysis": {
    name: "Data Analysis Committee",
    description:
      "Focuses on data science, AI workflows, predictive models, database administration, and analytics for GDG on Campus UJ activities.",
    headerSubtitle: "Leader · UJ",
    leaderDisplayName: "Shahad",
    coLeaderDisplayName: "Lina Saleh",
    leaderRoleDescription: "Primary Committee Leader",
    coLeaderRoleDescription: "Co-Leader & Database Administrator",
    settings: {
      notifyOnSubmission: true,
      autoApproveMembers: false,
    },
  },
  pr: {
    name: "Public Relations Committee",
    description: "Coordinates event registrations and supports the GDG UJ community.",
    headerSubtitle: "Public Relations · UJ",
    leaderDisplayName: "Committee Leader",
    coLeaderDisplayName: "Committee Co-Leader",
    leaderRoleDescription: "Primary committee administrator",
    coLeaderRoleDescription: "Secondary committee administrator",
    settings: {
      notifyOnSubmission: true,
      autoApproveMembers: false,
    },
  },
  "content-writing": {
    name: "Content Writing Committee", description: "Plans and creates clear, engaging content for GDG on Campus UJ.", headerSubtitle: "Content Writing · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
  "web-development": {
    name: "Web and Development Committee", description: "Builds and maintains digital experiences and platform projects for GDG on Campus UJ.", headerSubtitle: "Web and Development · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
  "automation-ai": {
    name: "Automation Committee", description: "Builds automated workflows and practical automation projects for GDG on Campus UJ.", headerSubtitle: "Automation · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
  "artificial-intelligence": {
    name: "Artificial Intelligence Committee", description: "Explores artificial intelligence and machine learning through GDG on Campus UJ activities.", headerSubtitle: "Artificial Intelligence · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
  "robotics-iot": {
    name: "Robotics & IoT Committee", description: "Connects software and hardware through robotics and Internet of Things projects.", headerSubtitle: "Robotics & IoT · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
  cybersecurity: {
    name: "Cybersecurity Committee", description: "Builds security awareness and practical cybersecurity skills in the GDG UJ community.", headerSubtitle: "Cybersecurity · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
  "digital-media-design": {
    name: "Digital Media and Design Committee", description: "Creates visual identities and digital media for GDG on Campus UJ.", headerSubtitle: "Digital Media & Design · UJ", leaderDisplayName: "Committee Leader", coLeaderDisplayName: "Committee Co-Leader", leaderRoleDescription: "Primary Committee Leader", coLeaderRoleDescription: "Committee Co-Leader", settings: { notifyOnSubmission: true, autoApproveMembers: false },
  },
};

export const defaultNewTaskDueDate = "Oct 20, 2026";
