"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import type { CommitteeMember } from "./types";
import { X, Trophy, PlusCircle, MinusCircle } from "lucide-react";

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: CommitteeMember | null;
}

export function PointsModal({ isOpen, onClose, member }: PointsModalProps) {
  const t = useTranslations("dashboard.leader");
  const { updateMemberPoints, canManagePoints, currentMember } = useLeaderDashboard();

  const [mode, setMode] = useState<"add" | "deduct">("add");
  const [pointsAmount, setPointsAmount] = useState<number | string>(50);
  const [reason, setReason] = useState<string>("");
  const [touched, setTouched] = useState<{ points?: boolean; reason?: boolean }>({});
  const [generalError, setGeneralError] = useState<string>("");

  if (!isOpen || !member || member.id === currentMember?.id) return null;

  const validatePoints = (val: number | string) => {
    if (val === "" || isNaN(Number(val))) {
      return t("points.required");
    }
    const num = Number(val);
    if (!Number.isInteger(num)) return t("points.integer");
    if (num <= 0) return t("points.positive");
    if (num > 2000) return t("points.max");
    if (mode === "deduct" && num > member.points) {
      return t("points.tooMany", { requested: num, available: member.points });
    }
    return "";
  };

  const validateReason = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("points.reasonRequired");
    if (trimmed.length < 5) return t("points.reasonMin");
    if (trimmed.length > 150) return t("points.reasonMax");
    return "";
  };

  const pointsError = touched.points ? validatePoints(pointsAmount) : "";
  const reasonError = touched.reason ? validateReason(reason) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ points: true, reason: true });

    const pErr = validatePoints(pointsAmount);
    const rErr = validateReason(reason);

    if (pErr || rErr) {
      setGeneralError(t("points.fixErrors"));
      return;
    }

    const delta = mode === "add" ? Number(pointsAmount) : -Number(pointsAmount);
    try {
      await updateMemberPoints(member.id, delta, reason.trim());
      setPointsAmount(50);
      setReason("");
      setTouched({});
      setGeneralError("");
      onClose();
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : t("points.requestFailed"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Trophy className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("points.modalTitle")}</h2>
              <p className="text-xs text-muted">{member.name} ? {t("points.current", { count: member.points.toLocaleString() })}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {!canManagePoints && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            {t("points.permission")}
          </div>
        )}

        {generalError && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-50/20 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Mode Switch: Add vs Deduct */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("add");
                if (generalError) setGeneralError("");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                mode === "add"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-border bg-surface text-muted hover:bg-surface-muted"
              }`}
            >
              <PlusCircle className="size-4" />
              <span>{t("points.award")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("deduct");
                if (generalError) setGeneralError("");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                mode === "deduct"
                  ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  : "border-border bg-surface text-muted hover:bg-surface-muted"
              }`}
            >
              <MinusCircle className="size-4" />
              <span>{t("points.deduct")}</span>
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground">
                {t("points.amount")}
              </label>
              <span className="text-[10px] text-muted">
                {t("points.wholeNumbers")}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {[20, 50, 80, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setPointsAmount(preset);
                    if (generalError) setGeneralError("");
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    pointsAmount === preset
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "border-border text-muted hover:bg-surface-muted"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="2000"
              value={pointsAmount}
              onChange={(e) => {
                setPointsAmount(e.target.value === "" ? "" : Number(e.target.value));
                if (generalError) setGeneralError("");
              }}
              onBlur={() => setTouched((p) => ({ ...p, points: true }))}
              className={`mt-2 h-10 w-full rounded-xl border px-3 text-sm text-foreground outline-none transition ${
                pointsError
                  ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                  : "border-border bg-surface-muted/30 focus:border-blue-500"
              }`}
            />
            {pointsError && (
              <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {pointsError}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground">
                {t("points.reason")}
              </label>
              <span className="text-[10px] text-muted">
                {reason.length}/150
              </span>
            </div>
            <input
              type="text"
              value={reason}
              maxLength={150}
              onChange={(e) => {
                setReason(e.target.value);
                if (generalError) setGeneralError("");
              }}
              onBlur={() => setTouched((p) => ({ ...p, reason: true }))}
              placeholder={t("points.reasonPlaceholder")}
              className={`mt-1 h-10 w-full rounded-xl border px-3 text-sm text-foreground outline-none transition ${
                reasonError
                  ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                  : "border-border bg-surface-muted/30 focus:border-blue-500"
              }`}
            />
            {reasonError && (
              <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {reasonError}
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-muted transition"
            >
              {t("points.cancel")}
            </button>
            <button
              type="submit"
              disabled={!canManagePoints || member.id === currentMember?.id}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {mode === "add" ? t("points.award") : t("points.deduct")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
