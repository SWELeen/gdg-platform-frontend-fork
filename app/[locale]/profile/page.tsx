"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { HangingBadge } from "@/components/badge/HangingBadge";
import { useMemberBadge } from "@/components/badge/useMemberBadge";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { ProfileBio } from "@/components/profile/ProfileBio";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Link, useRouter } from "@/i18n/navigation";
import type { InfoCardData } from "@/data/profile";
import { API_ENABLED, apiRequest } from "@/lib/api/client";
import type { AuthenticatedIdentity } from "@/lib/auth/dashboard-route";
import type { SocialLink } from "@/data/profile";
import { validateSocialLink } from "@/lib/validateSocialLink";

type SocialLinkPlatform = SocialLink["platform"];
type SocialLinkValues = Record<SocialLinkPlatform, string>;
const SOCIAL_LINK_PLATFORMS: SocialLinkPlatform[] = ["github", "portfolio", "x"];

type ProfileAccount = Partial<Pick<AuthenticatedIdentity, "committees" | "roles">> & {
  fullName: string;
  email: string | null;
  universityEmail: string | null;
  phoneNumber: string | null;
  university: string | null;
  branch: string | null;
  college: string | null;
  major: string | null;
  level: string | null;
  gender: string | null;
  bio: string | null;
  socialLinks: Record<SocialLinkPlatform, string | null>;
  profileImageUrl: string | null;
  joinDate: string | null;
};

function profileRows(account: ProfileAccount): [InfoCardData, InfoCardData] {
  const personalRows = [
    ["fullName", account.fullName],
    ["email", account.email],
    ["universityEmail", account.universityEmail],
    ["phone", account.phoneNumber],
    ["gender", account.gender],
  ] as const;
  const academicRows = [
    ["university", account.university],
    ["branch", account.branch],
    ["college", account.college],
    ["major", account.major],
    ["level", account.level],
  ] as const;
  const toRows = (rows: readonly (readonly [string, string | null])[]) =>
    rows.flatMap(([key, value]) =>
      value?.trim() ? [{ key, value }] : [],
    );

  return [
    {
      id: "personal",
      rows: toRows(personalRows),
    },
    {
      id: "academic",
      rows: toRows(academicRows),
    },
  ];
}

export default function ProfilePage({}: PageProps<"/[locale]/profile">) {
  const t = useTranslations("profile");
  const tBio = useTranslations("profile.bio");
  const tSocial = useTranslations("profile.social");
  const router = useRouter();
  const [account, setAccount] = useState<ProfileAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [bioError, setBioError] = useState("");
  const [bioSaved, setBioSaved] = useState(false);
  const [socialDraft, setSocialDraft] = useState<SocialLinkValues>({ github: "", portfolio: "", x: "" });
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [socialSaved, setSocialSaved] = useState(false);

  useEffect(() => {
    let active = true;
    if (!API_ENABLED) {
      setLoading(false);
      setLoadError(true);
      return () => { active = false; };
    }

    void apiRequest<ProfileAccount>("/me")
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          if (result.status === 401) {
            router.replace("/login?returnTo=%2Fprofile");
            return;
          }
          setLoadError(true);
        } else {
          setAccount(result.data);
          setBioDraft(result.data.bio ?? "");
          setSocialDraft({
            github: result.data.socialLinks?.github ?? "",
            portfolio: result.data.socialLinks?.portfolio ?? "",
            x: result.data.socialLinks?.x ?? "",
          });
        }
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [router]);

  const [personalInfo, academicInfo] = useMemo(
    () => account ? profileRows(account) : [
      { id: "personal", rows: [] },
      { id: "academic", rows: [] },
    ] as [InfoCardData, InfoCardData],
    [account],
  );
  // Committee members and global leaders get a 3D badge beside the cards, hanging
  // from the cover and staying in view while the page scrolls; on phones it
  // sits between the header and the cards. Anyone else gets the page without it.
  const badge = useMemberBadge({
    name: account?.fullName,
    university: account?.university,
    photoUrl: account?.profileImageUrl,
    gender: account?.gender,
    committees: account?.committees,
    roles: account?.roles,
  });

  async function saveBio() {
    if (isSavingBio) return;
    setIsSavingBio(true);
    setBioError("");
    setBioSaved(false);
    const result = await apiRequest<{ bio: string | null }>("/me/bio", {
      method: "PATCH",
      body: { bio: bioDraft },
    });
    setIsSavingBio(false);
    if (!result.ok) {
      if (result.status === 401) {
        router.replace("/login?returnTo=%2Fprofile");
        return;
      }
      setBioError(tBio("saveError"));
      return;
    }
    setAccount((current) => current ? { ...current, bio: result.data.bio } : current);
    setBioDraft(result.data.bio ?? "");
    setIsEditingBio(false);
    setBioSaved(true);
  }

  function cancelBioEdit() {
    setBioDraft(account?.bio ?? "");
    setBioError("");
    setIsEditingBio(false);
  }

  const socialLinks: SocialLink[] = SOCIAL_LINK_PLATFORMS.map((platform) => ({
    platform,
    value: account?.socialLinks?.[platform] ?? null,
  }));
  const socialErrors = Object.fromEntries(
    SOCIAL_LINK_PLATFORMS.map((platform) => [platform, validateSocialLink(platform, socialDraft[platform])]),
  ) as Record<SocialLinkPlatform, string | null>;

  async function saveSocialLinks() {
    if (isSavingSocial || Object.values(socialErrors).some(Boolean)) return;
    setIsSavingSocial(true);
    setSocialError("");
    setSocialSaved(false);
    try {
      const result = await apiRequest<{ socialLinks: Record<SocialLinkPlatform, string | null> }>("/me/social-links", {
        method: "PATCH",
        body: {
          githubUrl: socialDraft.github.trim() || null,
          portfolioUrl: socialDraft.portfolio.trim() || null,
          xUrl: socialDraft.x.trim() || null,
        },
      });
      if (!result.ok) {
        if (result.status === 401) {
          router.replace("/login?returnTo=%2Fprofile");
          return;
        }
        setSocialError(tSocial("saveError"));
        return;
      }
      setAccount((current) => current ? { ...current, socialLinks: result.data.socialLinks } : current);
      setSocialDraft({
        github: result.data.socialLinks.github ?? "",
        portfolio: result.data.socialLinks.portfolio ?? "",
        x: result.data.socialLinks.x ?? "",
      });
      setIsEditingSocial(false);
      setSocialSaved(true);
    } catch {
      setSocialError(tSocial("saveError"));
    } finally {
      setIsSavingSocial(false);
    }
  }

  function cancelSocialEdit() {
    setSocialDraft({
      github: account?.socialLinks?.github ?? "",
      portfolio: account?.socialLinks?.portfolio ?? "",
      x: account?.socialLinks?.x ?? "",
    });
    setSocialError("");
    setIsEditingSocial(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-x-clip bg-background text-foreground">
      <TopNav />

      <main
        className="flex w-full flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:pt-3 md:pb-8 lg:px-16"
      >
        {loading ? (
          <p role="status" className="py-10 text-center text-foreground/70">{t("loading")}</p>
        ) : loadError || !account ? (
          <p role="alert" className="py-10 text-center text-gdg-red">{t("loadError")}</p>
        ) : (
          <div className={`grid grid-cols-1 gap-4 ${badge ? "md:grid-cols-[minmax(0,1fr)_17rem] md:gap-x-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-8" : ""}`}>
            <div className="flex min-w-0 flex-col gap-4 md:col-start-1">
              <Link
                href="/registrations"
                className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-3 text-foreground shadow-sm transition-all duration-200 hover:border-[#4285f4]/50 hover:shadow-md sm:px-6"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#325fa6] dark:bg-[#243b64] dark:text-[#8ab4f8]">
                  <CalendarDays className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-start text-base font-semibold text-foreground">
                  {t("registrationsLink")}
                </span>
                <ChevronRight className="size-5 shrink-0 text-[#325fa6] transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-[#8ab4f8]" aria-hidden="true" />
              </Link>

              <ProfileBio
                bio={isEditingBio ? bioDraft : account.bio ?? ""}
                placeholder={tBio("placeholder")}
                isEditing={isEditingBio}
                isSaving={isSavingBio}
                error={bioError}
                saved={bioSaved}
                onChange={(value) => { setBioDraft(value); setBioSaved(false); }}
                onEdit={() => { setBioDraft(account.bio ?? ""); setBioError(""); setBioSaved(false); setIsEditingBio(true); }}
                onSave={() => { void saveBio(); }}
                onCancel={cancelBioEdit}
              />
              <ProfileTabs
                personalInfo={personalInfo}
                academicInfo={academicInfo}
                isEditing={false}
                infoValues={{}}
                infoErrors={{}}
                onInfoChange={() => {}}
                socialLinks={socialLinks}
                socialValues={socialDraft}
                socialErrors={socialErrors}
                isEditingSocial={isEditingSocial}
                isSavingSocial={isSavingSocial}
                socialError={socialError}
                socialSaved={socialSaved}
                onSocialEdit={() => { setSocialDraft({ github: account.socialLinks.github ?? "", portfolio: account.socialLinks.portfolio ?? "", x: account.socialLinks.x ?? "" }); setSocialError(""); setSocialSaved(false); setIsEditingSocial(true); }}
                onSocialChange={(platform, value) => { setSocialDraft((current) => ({ ...current, [platform]: value })); setSocialSaved(false); }}
                onSocialSave={() => { void saveSocialLinks(); }}
                onSocialCancel={cancelSocialEdit}
              />
            </div>
            {badge && (
              <HangingBadge
                {...badge}
                className="order-first h-[26rem] translate-y-3 md:order-none md:sticky md:top-24 md:col-start-2 md:row-start-1 md:h-[38rem]"
                stageClassName="top-0 -bottom-40 md:top-0 md:-bottom-[26rem]"
                spanViewport
                desktop={{ fit: 0.66, fitW: 0.86 }}
                phone={{ fit: 0.8, fitW: 0.62 }}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
