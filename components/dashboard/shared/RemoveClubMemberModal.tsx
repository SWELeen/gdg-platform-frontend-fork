"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, UserRoundX, X } from "lucide-react";
import type { CommitteeMember } from "./types";

type RemoveClubMemberModalProps = {
  isOpen: boolean;
  initialEmail?: string;
  committees: { code: string; name: string }[];
  members: CommitteeMember[];
  onClose: () => void;
  onConfirm: (email: string, committeeCode?: string) => Promise<void>;
};

export function RemoveClubMemberModal({
  isOpen,
  initialEmail = "",
  committees,
  members,
  onClose,
  onConfirm,
}: RemoveClubMemberModalProps) {
  const t = useTranslations("dashboard.leader");
  const [email, setEmail] = useState(initialEmail);
  const [committeeCode, setCommitteeCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const matchingMember = members.find((member) => member.email.trim().toLowerCase() === email.trim().toLowerCase());
  const availableScopes = useMemo(() => [
    ...(matchingMember?.committees ?? []).flatMap((membership) => {
      const committee = committees.find((option) => option.code === membership.code);
      return committee ? [{ code: membership.code, name: `${committee.name} · ${membership.role}` }] : [];
    }),
    ...(matchingMember?.globalRoles ?? []).flatMap((role) => {
      if (role === "ADVISOR") return [{ code: role, name: t("groupFilters.groupAdvisor") }];
      if (role === "DEVELOPER_COMMITTEES_LEADER") return [{ code: role, name: t("groupFilters.groupDeveloperLeader") }];
      return [];
    }),
  ], [committees, matchingMember, t]);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setCommitteeCode("");
      setError("");
      setSaving(false);
    }
  }, [initialEmail, isOpen]);

  useEffect(() => {
    if (committeeCode && !availableScopes.some((scope) => scope.code === committeeCode)) setCommitteeCode("");
  }, [availableScopes, committeeCode]);

  if (!isOpen) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setSaving(true);
    setError("");
    try {
      await onConfirm(normalizedEmail, committeeCode || undefined);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("groupFilters.removeMemberFailed"));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-club-member-title"
        className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-6"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <UserRoundX className="size-5" />
            </span>
            <div>
              <h2 id="remove-club-member-title" className="text-lg font-bold text-foreground">
                {t("groupFilters.removeMemberTitle")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {t("groupFilters.removeMemberDescription")}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label={t("members.cancel")} className="rounded-lg p-1.5 text-muted hover:bg-surface-muted">
            <X className="size-5" />
          </button>
        </header>

        <div>
          <label htmlFor="remove-club-member-email" className="mb-1.5 block text-sm font-semibold text-foreground">
            {t("groupFilters.removeMemberEmail")}
          </label>
          <input
            id="remove-club-member-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("groupFilters.removeMemberEmailPlaceholder")}
            disabled={saving}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="remove-club-member-committee" className="mb-1.5 block text-sm font-semibold text-foreground">
            {t("groupFilters.removeMemberCommittee")}
          </label>
          <select
            id="remove-club-member-committee"
            value={committeeCode}
            onChange={(event) => setCommitteeCode(event.target.value)}
            disabled={saving}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-60"
          >
            <option value="">{t("groupFilters.removeMemberAllCommittees")}</option>
            {availableScopes.map((scope) => <option key={scope.code} value={scope.code}>{scope.name}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-muted">
            {committeeCode === "ADVISOR" || committeeCode === "DEVELOPER_COMMITTEES_LEADER"
              ? t("groupFilters.removeMemberRoleDescription")
              : committeeCode
                ? t("groupFilters.removeMemberCommitteeDescription")
                : t("groupFilters.removeMemberAllDescription")}
          </p>
        </div>

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">{error}</p>}

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted disabled:opacity-60">
            {t("members.cancel")}
          </button>
          <button type="submit" disabled={saving || !email.trim()} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <LoaderCircle className="size-4 animate-spin" />}
            {t("groupFilters.removeMemberConfirm")}
          </button>
        </footer>
      </form>
    </div>
  );
}
