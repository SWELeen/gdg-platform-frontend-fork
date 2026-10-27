"use client";

import { PersonalAcademicPanel } from "@/components/profile/PersonalAcademicPanel";
import type { InfoCardData } from "@/data/profile";

type ProfileTabsProps = {
  personalInfo: InfoCardData;
  academicInfo: InfoCardData;
  isEditing: boolean;
  infoValues: Record<string, string>;
  infoErrors: Record<string, string | null>;
  onInfoChange: (key: string, value: string) => void;
};

export function ProfileTabs({
  personalInfo,
  academicInfo,
  isEditing,
  infoValues,
  infoErrors,
  onInfoChange,
}: ProfileTabsProps) {
  return (
    <PersonalAcademicPanel
      personalInfo={personalInfo}
      academicInfo={academicInfo}
      isEditing={isEditing}
      values={infoValues}
      errors={infoErrors}
      onChange={onInfoChange}
    />
  );
}
