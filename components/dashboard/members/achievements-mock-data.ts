// MOCK DATA — demonstration only. There is no approved achievements API contract yet
// (see docs/api-integration.md). Showing only the member's own data is a display choice,
// not access control; the backend must return only the signed-in member's own data.

export interface MemberPointEntry {
  id: string;
  title: string;
  date: string;
  amount: number;
}

export interface MemberCompletedTask {
  id: string;
  title: string;
  date: string;
}

export const memberPointHistory: MemberPointEntry[] = [
  { id: "point-1", title: "eventOrganization", date: "2026-10-12", amount: 30 },
  { id: "point-2", title: "communityContribution", date: "2026-10-01", amount: 25 },
  { id: "point-3", title: "lateSubmissionPenalty", date: "2026-09-20", amount: -10 },
  { id: "point-4", title: "workshopAttendance", date: "2026-09-12", amount: 15 },
  { id: "point-5", title: "projectShowcase", date: "2026-08-26", amount: 20 },
  { id: "point-6", title: "mentoringSession", date: "2026-07-14", amount: 40 },
  { id: "point-7", title: "documentationUpdates", date: "2026-06-03", amount: 10 },
  { id: "point-8", title: "accessibilityReview", date: "2026-05-22", amount: 15 },
];

export const memberCompletedTasks: MemberCompletedTask[] = [
  { id: "task-1", title: "websiteRedesign", date: "2026-10-11" },
  { id: "task-2", title: "eventRegistrationPage", date: "2026-10-07" },
  { id: "task-3", title: "teamDocumentation", date: "2026-09-28" },
  { id: "task-4", title: "dashboardComponents", date: "2026-09-15" },
  { id: "task-5", title: "uiImprovements", date: "2026-09-03" },
  { id: "task-6", title: "accessibilityReview", date: "2026-08-20" },
  { id: "task-7", title: "onboardingGuide", date: "2026-07-14" },
  { id: "task-8", title: "componentDocumentation", date: "2026-06-03" },
];
