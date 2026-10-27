"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { useCommitteeName } from "./ClubFilters";
import { X, UserPlus } from "lucide-react";

interface AddToCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SELECT_CLASS =
  "mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none transition focus:border-blue-500 disabled:opacity-50";

/** Club leadership: adds an existing member to another committee. New people still join through membership requests. */
export function AddToCommitteeModal({ isOpen, onClose }: AddToCommitteeModalProps) {
  const t = useTranslations("dashboard.leader");
  const { members, committees, addMemberToCommittee, canAddMembers } = useLeaderDashboard();
  const committeeName = useCommitteeName();
  const [memberId, setMemberId] = useState("");
  const [committeeCode, setCommitteeCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const member = members.find((item) => item.id === memberId);
  const memberCommitteeCodes = new Set((member?.committees ?? []).map((item) => item.code));
  const availableCommittees = committees.filter((item) => !memberCommitteeCodes.has(item.code));

  const close = () => {
    setMemberId("");
    setCommitteeCode("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !committeeCode) {
      setError(t("clubFilters.requiredSelection"));
      return;
    }
    setSubmitting(true);
    try {
      await addMemberToCommittee(memberId, committeeCode);
      close();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("clubFilters.requestFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={close} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("clubFilters.addToCommitteeTitle")}</h2>
              <p className="text-xs text-muted">{t("clubFilters.addToCommitteeDescription")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {!canAddMembers && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            {t("members.permission")}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="add-to-committee-member" className="block text-xs font-semibold text-foreground">
              {t("clubFilters.selectMember")} *
            </label>
            <select
              id="add-to-committee-member"
              value={memberId}
              onChange={(e) => {
                setMemberId(e.target.value);
                setCommitteeCode("");
                setError("");
              }}
              className={SELECT_CLASS}
            >
              <option value="">{t("clubFilters.selectMemberPlaceholder")}</option>
              {members.map((item) => (
                <option key={item.id} value={item.id}>{item.name}{item.email ? ` (${item.email})` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="add-to-committee-committee" className="block text-xs font-semibold text-foreground">
              {t("clubFilters.selectCommittee")} *
            </label>
            <select
              id="add-to-committee-committee"
              value={committeeCode}
              disabled={!member || availableCommittees.length === 0}
              onChange={(e) => {
                setCommitteeCode(e.target.value);
                setError("");
              }}
              className={SELECT_CLASS}
            >
              <option value="">{t("clubFilters.selectCommitteePlaceholder")}</option>
              {availableCommittees.map((item) => (
                <option key={item.code} value={item.code}>{committeeName(item.code, item.name)}</option>
              ))}
            </select>
            {member && availableCommittees.length === 0 && (
              <p className="mt-1 text-[11px] font-medium text-muted">{t("clubFilters.alreadyInAll")}</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/30 px-3 py-2.5 text-xs text-muted">
            {t("members.newMemberRole")}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-muted transition"
            >
              {t("members.cancel")}
            </button>
            <button
              type="submit"
              disabled={!canAddMembers || submitting || !memberId || !committeeCode}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {t("clubFilters.addToCommittee")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
