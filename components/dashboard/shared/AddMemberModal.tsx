"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { committeeTranslationKeys } from "./committee-config";
import { X, UserPlus } from "lucide-react";

interface AddMemberModalProps { isOpen: boolean; onClose: () => void; }

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const t = useTranslations("dashboard.leader");
  const { addMember, canAddMembers, committee } = useLeaderDashboard();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setError(t("members.emailInvalid")); return; }
    setSubmitting(true);
    try {
      await addMember({ email: normalizedEmail });
      setEmail(""); setError(""); onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("members.requestFailed"));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"><UserPlus className="size-5" /></span>
            <div><h2 className="text-lg font-bold text-foreground">{t("members.modalTitle")}</h2><p className="text-xs text-muted">{t("members.addDescription", { committee: t("nav." + committeeTranslationKeys[committee]) })}</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label={t("members.cancel")} className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-foreground"><X className="size-5" /></button>
        </div>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 p-3 text-xs text-muted">{t("members.existingAccountOnly")}</p>
        {error && <p role="alert" className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div><label htmlFor="committee-member-email" className="block text-xs font-semibold text-foreground">{t("members.accountEmail")} *</label><input id="committee-member-email" type="email" autoComplete="email" required value={email} maxLength={254} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder={t("members.accountEmailPlaceholder")} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" /></div>
          <div className="rounded-xl border border-border bg-surface-muted/30 px-3 py-2.5 text-xs text-muted">{t("members.newMemberRole")}</div>
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4"><button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-muted">{t("members.cancel")}</button><button type="submit" disabled={!canAddMembers || submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{submitting ? t("members.adding") : t("members.add")}</button></div>
        </form>
      </div>
    </div>
  );
}
