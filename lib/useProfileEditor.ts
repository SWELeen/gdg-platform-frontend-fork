"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import type { InfoCardData, SocialLink } from "@/data/profile";
import { validateInfoField } from "@/lib/validateInfoField";
import { validateSocialLink } from "@/lib/validateSocialLink";
import { useMemberSince } from "@/lib/useMemberSince";

/** The demo data a profile page starts from, until a profile API exists. */
export type ProfileSeed = {
  profile: { initials: string; name: string; email: string };
  bio: string;
  avatarUrl: string | null;
  headerImageUrl: string | null;
  personalInfo: InfoCardData;
  academicInfo: InfoCardData;
  socialLinks: SocialLink[];
};

function linksToValues(
  links: SocialLink[],
): Record<SocialLink["platform"], string> {
  return Object.fromEntries(
    links.map((link) => [link.platform, link.value ?? ""]),
  ) as Record<SocialLink["platform"], string>;
}

function cardsToValues(cards: InfoCardData[]): Record<string, string> {
  return Object.fromEntries(
    cards.flatMap((card) => card.rows.map((row) => [row.key, row.value])),
  );
}

export function findRowValue(card: InfoCardData, key: string): string {
  return card.rows.find((row) => row.key === key)?.value ?? "";
}

// The profile page's view and edit state: drafts, validation, save and cancel.
// Returns props ready to spread onto ProfileHero, ProfileBio and ProfileTabs.
export function useProfileEditor(seed: ProfileSeed) {
  const t = useTranslations("profile");
  const format = useFormatter();
  const memberSinceIso = useMemberSince();
  // Western digits keep dates consistent with the other numbers on the page.
  const memberSince = memberSinceIso
    ? format.dateTime(new Date(memberSinceIso), {
      month: "long",
      year: "numeric",
      numberingSystem: "latn",
    })
    : "";
  const [isEditing, setIsEditing] = useState(false);

  const [bio, setBio] = useState(seed.bio);
  const [bioDraft, setBioDraft] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(seed.avatarUrl);
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(seed.headerImageUrl);
  const [headerImageDraft, setHeaderImageDraft] = useState<string | null>(null);

  const [personalData, setPersonalData] = useState(seed.personalInfo);
  const [academicData, setAcademicData] = useState(seed.academicInfo);
  const [infoDrafts, setInfoDrafts] = useState(() =>
    cardsToValues([seed.personalInfo, seed.academicInfo]),
  );
  const [infoErrors, setInfoErrors] = useState<Record<string, string | null>>(
    {},
  );

  const [links, setLinks] = useState<SocialLink[]>(seed.socialLinks);
  const [linkDrafts, setLinkDrafts] = useState(() =>
    linksToValues(seed.socialLinks),
  );
  const [linkErrors, setLinkErrors] = useState<
    Record<SocialLink["platform"], string | null>
  >(() =>
    Object.fromEntries(seed.socialLinks.map((link) => [link.platform, null])) as Record<
      SocialLink["platform"],
      string | null
    >,
  );

  const handleEdit = () => {
    setBioDraft(bio);
    setAvatarDraft(avatarUrl);
    setHeaderImageDraft(headerImageUrl);
    setInfoDrafts(cardsToValues([personalData, academicData]));
    setInfoErrors({});
    setLinkDrafts(linksToValues(links));
    setLinkErrors(
      Object.fromEntries(links.map((link) => [link.platform, null])) as Record<
        SocialLink["platform"],
        string | null
      >,
    );
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (avatarDraft && avatarDraft !== avatarUrl) {
      URL.revokeObjectURL(avatarDraft);
    }

    if (headerImageDraft && headerImageDraft !== headerImageUrl) {
      URL.revokeObjectURL(headerImageDraft);
    }

    setIsEditing(false);
  };

  const handleAvatarSelect = (file: File) => {
    if (avatarDraft) URL.revokeObjectURL(avatarDraft);
    setAvatarDraft(URL.createObjectURL(file));
  };

  const handleHeaderImageSelect = (file: File) => {
    if (headerImageDraft) URL.revokeObjectURL(headerImageDraft);
    setHeaderImageDraft(URL.createObjectURL(file));
  };

  const handleInfoChange = (key: string, value: string) => {
    setInfoDrafts((prev) => ({ ...prev, [key]: value }));
    setInfoErrors((prev) => ({
      ...prev,
      [key]: validateInfoField(key, value),
    }));
  };

  const handleLinkChange = (
    platform: SocialLink["platform"],
    value: string,
  ) => {
    setLinkDrafts((prev) => ({ ...prev, [platform]: value }));
    setLinkErrors((prev) => ({
      ...prev,
      [platform]: validateSocialLink(platform, value),
    }));
  };

  const handleSave = () => {
    const nextLinkErrors = Object.fromEntries(
      links.map((link) => [
        link.platform,
        validateSocialLink(link.platform, linkDrafts[link.platform]),
      ]),
    ) as Record<SocialLink["platform"], string | null>;

    const nextInfoErrors = Object.fromEntries(
      Object.entries(infoDrafts).map(([key, value]) => [
        key,
        validateInfoField(key, value),
      ]),
    );

    setLinkErrors(nextLinkErrors);
    setInfoErrors(nextInfoErrors);

    if (
      Object.values(nextLinkErrors).some(Boolean) ||
      Object.values(nextInfoErrors).some(Boolean)
    ) {
      return;
    }

    setBio(bioDraft);
    setAvatarUrl(avatarDraft);
    setHeaderImageUrl(headerImageDraft);

    setPersonalData((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        value: infoDrafts[row.key] ?? row.value,
      })),
    }));

    setAcademicData((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        value: infoDrafts[row.key] ?? row.value,
      })),
    }));

    setLinks((prev) =>
      prev.map((link) => ({
        ...link,
        value: linkDrafts[link.platform].trim() || null,
      })),
    );

    setIsEditing(false);
  };

  const major = findRowValue(academicData, "major");
  const displayedMajor =
    major === "Software Engineering"
      ? t("academicValues.softwareEngineering")
      : major;

  const displayedName =
    seed.profile.name === "Jana Alshaikh"
      ? t("academicValues.janaAlshaikh")
      : seed.profile.name;

  const studentId = findRowValue(personalData, "studentId");
  const chips = [
    displayedMajor,
    studentId && t("chips.studentId", { id: studentId }),
  ].filter(Boolean) as string[];

  return {
    hero: {
      initials: seed.profile.initials,
      name: displayedName,
      email: seed.profile.email,
      chips,
      memberSince,
      avatarUrl: isEditing ? avatarDraft : avatarUrl,
      headerImageUrl: isEditing ? headerImageDraft : headerImageUrl,
      isEditing,
      onEdit: handleEdit,
      onSave: handleSave,
      onCancel: handleCancel,
      onAvatarSelect: handleAvatarSelect,
      onHeaderImageSelect: handleHeaderImageSelect,
    },
    bio: {
      bio: isEditing ? bioDraft : bio,
      placeholder: t("bio.placeholder"),
      isEditing,
      onChange: setBioDraft,
    },
    tabs: {
      personalInfo: personalData,
      academicInfo: academicData,
      socialLinks: links,
      isEditing,
      infoValues: infoDrafts,
      infoErrors,
      onInfoChange: handleInfoChange,
      socialLinkValues: linkDrafts,
      socialLinkErrors: linkErrors,
      onSocialLinkChange: handleLinkChange,
    },
    /** Saved values (not drafts), for anything that mirrors the profile. */
    saved: { bio, avatarUrl, personalData, academicData, links, memberSince },
  };
}
