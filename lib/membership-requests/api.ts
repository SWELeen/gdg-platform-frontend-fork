import { API_ENABLED, apiRequest, type ApiResult } from "@/lib/api/client";

export type MembershipDecision = "PENDING" | "APPROVED" | "REJECTED";

export interface MembershipRequest {
  id: number;
  status: MembershipDecision;
  submittedAt: string;
  applicant: {
    fullName: string;
    email: string | null;
    universityEmail: string | null;
    details: {
      phoneNumber: string;
      universityEmail: string;
      university: string;
      branch?: string;
      college: string;
      major: string;
      level: string;
      gender: string;
    };
  };
  committees: Array<{
    code: string;
    name: string;
    status: MembershipDecision;
    requestedRole: string;
    decidedAt: string | null;
  }>;
  committeeDecision?: {
    committeeCode: string;
    status: MembershipDecision;
    requestedRole: string;
    decidedAt: string | null;
  };
}

export interface MembershipApplicationPayload {
  applicationData: MembershipRequest["applicant"]["details"];
  committees: Array<{ committeeCode: string; requestedRole: string }>;
  requestedGlobalRoles?: string[];
}

export interface LeadershipApplication {
  id: number;
  type: "COMMITTEE_LEADERSHIP" | "GLOBAL_ROLE";
  submittedAt: string;
  decisionStatus: MembershipDecision;
  applicant: MembershipRequest["applicant"];
  committee?: { committeeCode: string; committeeName: string };
  requestedRole?: string;
  role?: { roleCode: string; description: string | null };
}

export function fetchLeadershipApplications(scope: "CLUB" | "DEVELOPER_COMMITTEES") {
  return apiRequest<LeadershipApplication[]>(`/membership-requests/leadership?scope=${scope}`);
}

export function decideLeadershipApplication(application: LeadershipApplication, decision: "APPROVED" | "REJECTED") {
  const suffix = application.type === "GLOBAL_ROLE"
    ? `global-roles/${encodeURIComponent(application.role?.roleCode ?? "")}`
    : `committees/${encodeURIComponent(application.committee?.committeeCode ?? "")}`;
  return apiRequest(`/membership-requests/${application.id}/leadership/${suffix}`, { method: "PATCH", body: { decision } });
}

export async function fetchMembershipRequests(committeeCode: string): Promise<ApiResult<MembershipRequest[]>> {
  if (!API_ENABLED) {
    return { ok: false, status: 0, code: "API_DISABLED", message: "API mode is disabled." };
  }
  return apiRequest<MembershipRequest[]>(`/membership-requests?committeeCode=${encodeURIComponent(committeeCode)}`);
}

export function submitMembershipRequest(payload: MembershipApplicationPayload) {
  return apiRequest<MembershipRequest>("/membership-requests", { method: "POST", body: payload });
}

export function decideMembershipRequest(
  requestId: number,
  committeeCode: string,
  decision: "APPROVED" | "REJECTED",
) {
  return apiRequest<MembershipRequest>(
    `/membership-requests/${requestId}/committees/${encodeURIComponent(committeeCode)}`,
    { method: "PATCH", body: { decision } },
  );
}
