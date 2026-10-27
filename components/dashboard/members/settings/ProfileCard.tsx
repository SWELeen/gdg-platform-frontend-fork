"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Lock, UserRound } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { MemberProfile } from "@/lib/members/profile";
import { SettingsCard } from "./SettingsCard";

function ProfileRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="text-sm font-semibold text-foreground sm:text-end">{children}</dd>
    </div>
  );
}

/** Read-only view of the member's own profile and committee (no edit controls). */
export function ProfileCard() {
  const t = useTranslations("dashboard.memberSettings.profile");
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiRequest<{ fullName: string; email: string | null; committees: Array<{ name: string; position: string }>; roles: string[] }>("/me")
      .then((result) => {
        if (!result.ok) return;
        const committee = result.data.committees[0];
        const fullName = result.data.fullName;
        setProfile({
          fullName,
          initials: fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
          email: result.data.email ?? undefined,
          committee: committee?.name,
          role: committee?.position ?? result.data.roles[0],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsCard
      id="member-profile"
      icon={UserRound}
      iconClassName="bg-gdg-blue-light text-gdg-dark"
      title={t("title")}
      description={t("description")}
      aside={
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted">
          <Lock className="size-3" aria-hidden="true" />
          {t("readOnly")}
        </span>
      }
    >
      <div className="flex items-center gap-3 rounded-xl bg-surface-muted/50 p-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gdg-blue-light text-sm font-bold text-gdg-dark" aria-hidden="true">
          {profile?.initials ?? "—"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{loading ? t("loading") : profile?.fullName ?? t("notAvailable")}</p>
          {profile?.committee && profile.role && (
            <p className="truncate text-xs text-muted">
              {profile.committee} · {profile.role}
            </p>
          )}
        </div>
      </div>

      <dl className="mt-2 divide-y divide-border">
        <ProfileRow label={t("fullName")}>{profile?.fullName ?? t("notAvailable")}</ProfileRow>
        {profile?.email && (
          <ProfileRow label={t("email")}>
            <span dir="ltr">{profile.email}</span>
          </ProfileRow>
        )}
        <ProfileRow label={t("committee")}>{profile?.committee ?? t("notAvailable")}</ProfileRow>
        <ProfileRow label={t("role")}>{profile?.role ?? t("notAvailable")}</ProfileRow>
      </dl>

      <p className="mt-3 text-xs text-muted">{t("managedByLeadership")}</p>
    </SettingsCard>
  );
}
