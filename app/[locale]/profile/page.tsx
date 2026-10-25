"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { ProfileBio } from "@/components/profile/ProfileBio";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { CalendarDays, ChevronRight } from "lucide-react";
import {
  academicInfo,
  initialProfileAvatarUrl,
  initialProfileBio,
  initialProfileHeaderImageUrl,
  personalInfo,
  sampleProfile,
  socialLinks,
  type InfoCardData,
  type SocialLink,
} from "@/data/profile";
import { validateInfoField } from "@/lib/validateInfoField";
import { validateSocialLink } from "@/lib/validateSocialLink";
import { useMemberSince } from "@/lib/useMemberSince";
import { API_ENABLED, apiRequest } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";

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

function findRowValue(card: InfoCardData, key: string): string {
  return card.rows.find((row) => row.key === key)?.value ?? "";
}

export default function ProfilePage({ }: PageProps<"/[locale]/profile">) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const format = useFormatter();
  const memberSinceIso = useMemberSince();
  const router = useRouter();
  const [account, setAccount] = useState<{ fullName: string; email: string | null } | null>(null);
  // Western digits keep dates consistent with the other numbers on the page.
  const memberSince = memberSinceIso
    ? format.dateTime(new Date(memberSinceIso), {
      month: "long",
      year: "numeric",
      numberingSystem: "latn",
    })
    : "";
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    void apiRequest<{ fullName: string; email: string | null }>("/me").then((result) => {
      if (!active) return;
      if (!result.ok) {
        if (result.status === 401) router.replace("/login?returnTo=%2Fprofile");
        return;
      }
      setAccount(result.data);
    });
    return () => { active = false; };
  }, [router]);

  const [bio, setBio] = useState(initialProfileBio);
  const [bioDraft, setBioDraft] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfileAvatarUrl);
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(initialProfileHeaderImageUrl);
  const [headerImageDraft, setHeaderImageDraft] = useState<string | null>(null);

  const [personalData, setPersonalData] = useState(personalInfo);
  const [academicData, setAcademicData] = useState(academicInfo);
  const [infoDrafts, setInfoDrafts] = useState(() =>
    cardsToValues([personalInfo, academicInfo]),
  );
  const [infoErrors, setInfoErrors] = useState<Record<string, string | null>>(
    {},
  );

  const [links, setLinks] = useState<SocialLink[]>(socialLinks);
  const [linkDrafts, setLinkDrafts] = useState(() =>
    linksToValues(socialLinks),
  );
  const [linkErrors, setLinkErrors] = useState<
    Record<SocialLink["platform"], string | null>
  >(() =>
    Object.fromEntries(socialLinks.map((link) => [link.platform, null])) as Record<
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

  const displayedName = account?.fullName ?? (API_ENABLED ? "" :
    sampleProfile.name === "Jana Alshaikh"
      ? t("academicValues.janaAlshaikh")
      : sampleProfile.name);
  const displayedPersonalData: InfoCardData = {
    ...personalData,
    rows: personalData.rows.map((row) =>
      row.key === "fullName" && account ? { ...row, value: account.fullName }
        : row.key === "email" && account ? { ...row, value: account.email ?? "" }
          : row,
    ),
  };

  const studentId = findRowValue(personalData, "studentId");
 const chips = [
  displayedMajor,
  studentId && t("chips.studentId", { id: studentId }),
].filter(Boolean) as string[];

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <TopNav />

      <ProfileHero
        initials={displayedName.slice(0, 1) || sampleProfile.initials}
        name={displayedName}
        email={account?.email ?? (API_ENABLED ? "" : sampleProfile.email)}
        chips={chips}

        memberSince={memberSince}
        avatarUrl={isEditing ? avatarDraft : avatarUrl}
        headerImageUrl={isEditing ? headerImageDraft : headerImageUrl}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAvatarSelect={handleAvatarSelect}
        onHeaderImageSelect={handleHeaderImageSelect}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 sm:py-6 md:gap-4 md:px-10 md:pt-3 md:pb-8 lg:px-16">   <div className="flex justify-end">

        <Link
          href="/registrations"
          className="group flex w-full items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:border-[#4285f4]/50 hover:shadow-md dark:border-[#243b64]/70 dark:bg-surface sm:px-6"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#325fa6] dark:bg-[#243b64] dark:text-[#8ab4f8]">    <CalendarDays className="size-6" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1 text-start text-base font-semibold text-[#243b64] dark:text-white">
            {t("registrationsLink")}
          </span>

          <ChevronRight
            className="size-5 shrink-0 text-[#325fa6] transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-[#8ab4f8]"
            aria-hidden="true"
          />
        </Link>
      </div>


        <ProfileBio
          bio={isEditing ? bioDraft : bio}
          placeholder={t("bio.placeholder")}
          isEditing={isEditing}
          onChange={setBioDraft}
        />

        <ProfileTabs
          personalInfo={displayedPersonalData}
          academicInfo={academicData}
          socialLinks={links}
          isEditing={isEditing}
          infoValues={infoDrafts}
          infoErrors={infoErrors}
          onInfoChange={handleInfoChange}
          socialLinkValues={linkDrafts}
          socialLinkErrors={linkErrors}
          onSocialLinkChange={handleLinkChange}
        />
      </main>

      <Footer />
    </div>
  );
}
