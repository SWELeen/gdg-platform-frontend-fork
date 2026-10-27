"use client";

import { PersonalAcademicPanel } from "@/components/profile/PersonalAcademicPanel";
import { SocialLinksPanel } from "@/components/profile/SocialLinksPanel";
import type { InfoCardData, SocialLink } from "@/data/profile";
import { useState } from "react";
import { useTranslations } from "next-intl";

type SocialLinkPlatform = SocialLink["platform"];

type ProfileTabsProps = {
  personalInfo: InfoCardData;
  academicInfo: InfoCardData;
  isEditing: boolean;
  infoValues: Record<string, string>;
  infoErrors: Record<string, string | null>;
  onInfoChange: (key: string, value: string) => void;
  socialLinks: SocialLink[];
  socialValues: Record<SocialLinkPlatform, string>;
  socialErrors: Record<SocialLinkPlatform, string | null>;
  isEditingSocial: boolean;
  isSavingSocial: boolean;
  socialError: string;
  socialSaved: boolean;
  onSocialEdit: () => void;
  onSocialChange: (platform: SocialLinkPlatform, value: string) => void;
  onSocialSave: () => void;
  onSocialCancel: () => void;
};

export function ProfileTabs({
  personalInfo,
  academicInfo,
  isEditing,
  infoValues,
  infoErrors,
  onInfoChange,
  socialLinks,
  socialValues,
  socialErrors,
  isEditingSocial,
  isSavingSocial,
  socialError,
  socialSaved,
  onSocialEdit,
  onSocialChange,
  onSocialSave,
  onSocialCancel,
}: ProfileTabsProps) {
  const t = useTranslations("profile.tabs");
  const [activeTab, setActiveTab] = useState<"personal" | "social">("personal");

  return (
    <section>
      <div className="mb-4 flex gap-7 border-b border-gray-200 dark:border-white/10" role="tablist" aria-label={t("label")}>
        <button type="button" role="tab" aria-selected={activeTab === "personal"} onClick={() => setActiveTab("personal")} className={`border-b-2 px-0 pb-2 text-base font-semibold transition-colors ${activeTab === "personal" ? "border-[#4285f4] text-[#4285f4]" : "border-transparent text-foreground/70 hover:text-foreground"}`}>
          {t("personal")}
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "social"} onClick={() => setActiveTab("social")} className={`border-b-2 px-0 pb-2 text-base font-semibold transition-colors ${activeTab === "social" ? "border-[#4285f4] text-[#4285f4]" : "border-transparent text-foreground/70 hover:text-foreground"}`}>
          {t("social")}
        </button>
      </div>
      <div role="tabpanel">
        {activeTab === "personal" ? (
          <PersonalAcademicPanel
            personalInfo={personalInfo}
            academicInfo={academicInfo}
            isEditing={isEditing}
            values={infoValues}
            errors={infoErrors}
            onChange={onInfoChange}
          />
        ) : (
          <SocialLinksPanel
            links={socialLinks}
            isEditing={isEditingSocial}
            values={socialValues}
            errors={socialErrors}
            isSaving={isSavingSocial}
            error={socialError}
            saved={socialSaved}
            onChange={onSocialChange}
            onEdit={onSocialEdit}
            onSave={onSocialSave}
            onCancel={onSocialCancel}
          />
        )}
      </div>
    </section>
  );
}
