"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { committees } from "@/lib/badge/themes";
import type { BadgeData, Membership } from "@/lib/badge/types";

type MemberBadgeInput = {
  name: string;
  university: string;
  photoUrl: string | null;
  /** null for someone who isn't in a committee: they get no badge. */
  membership: Membership | null;
};

// Builds a member's badge from their profile and committee membership.
export function useMemberBadge({ name, university, photoUrl, membership }: MemberBadgeInput) {
  const t = useTranslations("profile.badge");
  const committee = membership && committees[membership.committeeId];
  const role = membership?.role;

  const data = useMemo<BadgeData | null>(
    () =>
      committee && role
        ? {
          name,
          role,
          committee: committee.shortName,
          chapter: "Google Developer Group on Campus",
          university: university || "University of Jeddah",
          photoUrl,
        }
        : null,
    [committee, role, name, university, photoUrl],
  );

  if (!committee || !data) return null;
  return {
    data,
    theme: committee.theme,
    label: t("label", { name: data.name, role: data.role, committee: data.committee }),
  };
}
