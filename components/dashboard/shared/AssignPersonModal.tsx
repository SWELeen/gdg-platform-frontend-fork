"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, UserPlus } from "lucide-react";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import type { MemberAssignmentRole } from "@/lib/committee-dashboard/api";

const GLOBAL_ROLES: MemberAssignmentRole[] = ["ADVISOR", "DEVELOPER_COMMITTEES_LEADER"];
const COMMITTEE_ROLES: MemberAssignmentRole[] = ["Member", "Leader", "Co-Leader"];

export function AssignPersonModal({ isOpen, onClose, scope }: { isOpen: boolean; onClose: () => void; scope: "club" | "developer" }) {
  const t = useTranslations("dashboard.leader");
  const { committees, developerCommitteesOverview, assignPerson, canAddMembers, canAssignDeveloperMembers } = useLeaderDashboard();
  const roles = scope === "club" ? (canAddMembers ? [...COMMITTEE_ROLES, ...GLOBAL_ROLES] : []) : (canAssignDeveloperMembers ? COMMITTEE_ROLES : []);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberAssignmentRole>("Member");
  const [committeeCode, setCommitteeCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!isOpen) return null;

  const isGlobalRole = GLOBAL_ROLES.includes(role);
  const choices = scope === "developer"
    ? developerCommitteesOverview.map(({ code, name }) => ({ code, name }))
    : committees.filter(({ code }) => code !== "DEV");
  const close = () => { setEmail(""); setRole("Member"); setCommitteeCode(""); setError(""); onClose(); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setError(t("members.emailInvalid")); return; }
    if (!isGlobalRole && !committeeCode) { setError(t("groupFilters.requiredAssignment")); return; }
    setSubmitting(true);
    try {
      await assignPerson({ email: normalizedEmail, role, ...(isGlobalRole ? {} : { committeeCode }) });
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("groupFilters.requestFailed"));
    } finally { setSubmitting(false); }
  };
  const roleText = (value: MemberAssignmentRole) => {
    if (value === "Member") return t("groupFilters.roleMember");
    if (value === "Leader") return t("groupFilters.roleLeader");
    if (value === "Co-Leader") return t("groupFilters.roleCoLeader");
    if (value === "ADVISOR") return t("groupFilters.roleAdvisor");
    if (value === "DEVELOPER_COMMITTEES_LEADER") return t("groupFilters.roleDeveloperLeader");
    return t("groupFilters.roleMember");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={close} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <header className="flex items-center justify-between border-b border-border pb-4"><div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"><UserPlus className="size-5" /></span><div><h2 className="text-lg font-bold text-foreground">{t("groupFilters.assignPersonTitle")}</h2><p className="text-xs text-muted">{t("groupFilters.assignPersonDescription")}</p></div></div><button type="button" onClick={close} aria-label={t("members.cancel")} className="rounded-lg p-1.5 text-muted hover:bg-surface-muted"><X className="size-5" /></button></header>
        {scope === "club" && !canAddMembers && <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700">{t("members.permission")}</p>}
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 p-3 text-xs text-muted">{t("members.existingAccountOnly")}</p>
        {error && <p role="alert" className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600">{error}</p>}
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div><label htmlFor="assign-person-email" className="block text-xs font-semibold text-foreground">{t("members.accountEmail")} *</label><input id="assign-person-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder={t("members.accountEmailPlaceholder")} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" /></div>
          <div><label htmlFor="assign-person-role" className="block text-xs font-semibold text-foreground">{t("members.assignmentRole")} *</label><select id="assign-person-role" value={role} onChange={(event) => { setRole(event.target.value as MemberAssignmentRole); setCommitteeCode(""); setError(""); }} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground">{roles.map((item) => <option key={item} value={item}>{roleText(item)}</option>)}</select></div>
          {!isGlobalRole && <div><label htmlFor="assign-person-committee" className="block text-xs font-semibold text-foreground">{t("groupFilters.selectCommittee")} *</label><select id="assign-person-committee" required value={committeeCode} onChange={(event) => setCommitteeCode(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground"><option value="">{t("groupFilters.selectCommitteePlaceholder")}</option>{choices.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></div>}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4"><button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-muted">{t("members.cancel")}</button><button type="submit" disabled={submitting || (scope === "club" && !canAddMembers) || (scope === "developer" && !canAssignDeveloperMembers) || (roles.length === 0) || (!isGlobalRole && choices.length === 0)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{submitting ? t("members.adding") : t("members.add")}</button></div>
        </form>
      </div>
    </div>
  );
}
