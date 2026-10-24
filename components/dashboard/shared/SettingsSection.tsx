"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { leaderCommitteeConfig } from "./committee-config";
import { leaderDashboardMockData } from "@/data/leader-dashboard";
import { Check, Shield, Bell, Save } from "lucide-react";

export function SettingsSection() {
  const t = useTranslations("dashboard.leader");
  const leadershipT = useTranslations("dashboard.leadershipDashboard");
  const { canManageSettings, committeeName, committeeDescription, committee, clubLeadership } = useLeaderDashboard();
  const config = leaderCommitteeConfig[committee];
  const defaultSettings = leaderDashboardMockData[committee].settings;

  const [name, setName] = useState(committeeName);
  const [description, setDescription] = useState(committeeDescription);
  const [notifyOnSubmission, setNotifyOnSubmission] = useState(defaultSettings.notifyOnSubmission);
  const [autoApproveMembers, setAutoApproveMembers] = useState(defaultSettings.autoApproveMembers);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({});
  const [generalError, setGeneralError] = useState("");

  const validateName = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("settings.requiredName");
    if (trimmed.length < 3) return t("settings.nameMin");
    if (trimmed.length > 100) return t("settings.nameMax");
    return "";
  };

  const validateDesc = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("settings.requiredDescription");
    if (trimmed.length < 10) return t("settings.descriptionMin");
    if (trimmed.length > 500) return t("settings.descriptionMax");
    return "";
  };

  const nameError = touched.name ? validateName(name) : "";
  const descError = touched.description ? validateDesc(description) : "";

  const handleSave = () => {
    setTouched({ name: true, description: true });
    const nErr = validateName(name);
    const dErr = validateDesc(description);

    if (nErr || dErr) {
      setGeneralError(t("settings.validationSummary"));
      return;
    }

    setGeneralError("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Check className="size-4 text-emerald-600" />
          <span>{t("settings.saved")}</span>
        </div>
      )}

      {generalError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-50/20 p-4 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
          {generalError}
        </div>
      )}

      {/* Committee Profile */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xs">
        <h3 className="text-base font-bold text-foreground">
          {t("settings.info")}
        </h3>
        <p className="text-xs text-muted">
          {t("settings.profileDescription", { committee: committeeName })}
        </p>

        <div className="mt-5 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-foreground">
                {t("settings.committeeName")}
              </label>
              <span className="text-[10px] text-muted">
                {name.length}/100
              </span>
            </div>
            <input
              type="text"
              value={name}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
                if (generalError) setGeneralError("");
              }}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              disabled={!canManageSettings}
              className={`mt-1 h-10 w-full rounded-xl border px-3 text-sm text-foreground outline-none transition disabled:opacity-60 ${
                nameError
                  ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                  : "border-border bg-surface-muted/30 focus:border-blue-500"
              }`}
            />
            {nameError && (
              <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-foreground">
                {t("settings.description")}
              </label>
              <span className="text-[10px] text-muted">
                {description.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
                if (generalError) setGeneralError("");
              }}
              onBlur={() => setTouched((p) => ({ ...p, description: true }))}
              disabled={!canManageSettings}
              className={`mt-1 w-full rounded-xl border p-3 text-sm text-foreground outline-none transition disabled:opacity-60 ${
                descError
                  ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                  : "border-border bg-surface-muted/30 focus:border-blue-500"
              }`}
            />
            {descError && (
              <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {descError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leadership & Permissions */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-blue-500" />
          <h3 className="text-base font-bold text-foreground">
            {t("settings.leadership")}
          </h3>
        </div>
        <p className="text-xs text-muted">
          {t("settings.leadershipDescription")}
        </p>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-border/80 p-3">
            <div>
              <span className="font-bold text-foreground block">{clubLeadership ? leadershipT("clubLeaderRole") : config.leaderDisplayName}</span>
              <span className="text-muted block text-[11px]">{clubLeadership ? leadershipT("clubLeaderDescription") : config.leaderRoleDescription}</span>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {t("settings.leader")}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/80 p-3">
            <div>
              <span className="font-bold text-foreground block">{clubLeadership ? leadershipT("clubCoLeaderRole") : config.coLeaderDisplayName}</span>
              <span className="text-muted block text-[11px]">{clubLeadership ? leadershipT("clubCoLeaderDescription") : config.coLeaderRoleDescription}</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {t("settings.coLeader")}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-blue-500" />
          <h3 className="text-base font-bold text-foreground">
            {t("settings.notificationPreferences")}
          </h3>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-semibold text-foreground block">
                {config.registrationNotificationTitle}
              </span>
              <span className="text-muted text-[11px]">
                {config.registrationNotificationDescription}
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyOnSubmission}
              onChange={(e) => setNotifyOnSubmission(e.target.checked)}
              disabled={!canManageSettings}
              className="size-4 accent-blue-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-border/60 pt-3">
            <div>
              <span className="font-semibold text-foreground block">
                {t("settings.selfAssign")}
              </span>
              <span className="text-muted text-[11px]">
                {t("settings.selfAssignDescription")}
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoApproveMembers}
              onChange={(e) => setAutoApproveMembers(e.target.checked)}
              disabled={!canManageSettings}
              className="size-4 accent-blue-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      {canManageSettings && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Save className="size-4" />
            <span>{t("settings.save")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
