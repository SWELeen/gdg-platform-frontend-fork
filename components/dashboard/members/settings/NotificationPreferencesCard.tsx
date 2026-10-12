"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, CalendarDays, CircleAlert, CircleCheck, Info, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  defaultNotificationPreferences,
  saveNotificationPreference,
  useNotificationPreferences,
  type NotificationPreferenceKey,
} from "@/lib/members/notification-preferences";
import { SettingsCard, Switch } from "./SettingsCard";

const groups: { id: "tasks" | "events"; icon: LucideIcon; keys: NotificationPreferenceKey[] }[] = [
  { id: "tasks", icon: ListChecks, keys: ["taskAssigned", "taskDeadline", "taskUpdates"] },
  { id: "events", icon: CalendarDays, keys: ["newEvents", "registrationUpdates"] },
];

type Feedback = { key: NotificationPreferenceKey; enabled: boolean; saved: boolean } | null;

/** The member's own notification preferences; each toggle saves immediately. */
export function NotificationPreferencesCard() {
  const t = useTranslations("dashboard.memberSettings.notifications");
  const state = useNotificationPreferences();
  const [feedback, setFeedback] = useState<Feedback>(null);

  const preferences = state.status === "loading" ? defaultNotificationPreferences : state.preferences;
  const disabled = state.status !== "ready";

  const toggle = (key: NotificationPreferenceKey, enabled: boolean) => {
    setFeedback({ key, enabled, saved: saveNotificationPreference(key, enabled) });
  };

  return (
    <SettingsCard
      id="member-notifications"
      icon={Bell}
      iconClassName="bg-gdg-yellow-light text-gdg-dark"
      title={t("title")}
      description={t("description")}
    >
      <p className="flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 text-xs leading-5 text-foreground/80">
        <Info className="mt-0.5 size-4 shrink-0 text-gdg-blue" aria-hidden="true" />
        {t("deliveryNote")}
      </p>

      {state.status === "unavailable" && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t("storageUnavailable")}
        </p>
      )}

      <div className="mt-5 space-y-6" aria-busy={state.status === "loading"}>
        {groups.map((group) => (
          <div key={group.id} role="group" aria-labelledby={`notification-group-${group.id}`}>
            <h3 id={`notification-group-${group.id}`} className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <group.icon className="size-4 text-muted" aria-hidden="true" />
              {t(`groups.${group.id}`)}
            </h3>
            <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
              {group.keys.map((key) => (
                <li key={key} className="flex items-center justify-between gap-4 p-3 sm:p-4">
                  <div className="min-w-0">
                    <p id={`notification-${key}-label`} className="text-sm font-medium text-foreground">
                      {t(`items.${key}.label`)}
                    </p>
                    <p id={`notification-${key}-description`} className="mt-0.5 text-xs text-muted">
                      {t(`items.${key}.description`)}
                    </p>
                  </div>
                  <Switch
                    checked={preferences[key]}
                    disabled={disabled}
                    onChange={(enabled) => toggle(key, enabled)}
                    labelledBy={`notification-${key}-label`}
                    describedBy={`notification-${key}-description`}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="mt-4 min-h-5 text-xs">
        {feedback &&
          (feedback.saved ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CircleCheck className="size-4" aria-hidden="true" />
              {t(feedback.enabled ? "savedOn" : "savedOff", { item: t(`items.${feedback.key}.label`) })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
              <CircleAlert className="size-4" aria-hidden="true" />
              {t("saveFailed")}
            </span>
          ))}
      </p>
    </SettingsCard>
  );
}
