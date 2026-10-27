"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { ProfileBio } from "@/components/profile/ProfileBio";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Link, useRouter } from "@/i18n/navigation";
import type { InfoCardData } from "@/data/profile";
import { API_ENABLED, apiRequest } from "@/lib/api/client";

type ProfileAccount = {
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
  const format = useFormatter();
  const router = useRouter();
  const [account, setAccount] = useState<ProfileAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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
  const memberSince = account?.joinDate
    ? format.dateTime(new Date(account.joinDate), {
        month: "long",
        year: "numeric",
        numberingSystem: "latn",
      })
    : null;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <TopNav />
      {account && (
        <ProfileHero
          initials={account.fullName.trim().slice(0, 1)}
          name={account.fullName}
          email={account.email ?? ""}
          memberSince={memberSince}
          avatarUrl={account.profileImageUrl}
        />
      )}

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 sm:py-6 md:gap-4 md:px-10 md:pt-3 md:pb-8 lg:px-16">
        {loading ? (
          <p role="status" className="py-10 text-center text-foreground/70">{t("loading")}</p>
        ) : loadError || !account ? (
          <p role="alert" className="py-10 text-center text-gdg-red">{t("loadError")}</p>
        ) : (
          <>
            <Link
              href="/registrations"
              className="group flex w-full items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:border-[#4285f4]/50 hover:shadow-md dark:border-[#243b64]/70 dark:bg-surface sm:px-6"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#325fa6] dark:bg-[#243b64] dark:text-[#8ab4f8]">
                <CalendarDays className="size-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-start text-base font-semibold text-[#243b64] dark:text-white">
                {t("registrationsLink")}
              </span>
              <ChevronRight className="size-5 shrink-0 text-[#325fa6] transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-[#8ab4f8]" aria-hidden="true" />
            </Link>

            <ProfileBio bio={account.bio ?? ""} placeholder="" isEditing={false} onChange={() => {}} />
            <ProfileTabs
              personalInfo={personalInfo}
              academicInfo={academicInfo}
              isEditing={false}
              infoValues={{}}
              infoErrors={{}}
              onInfoChange={() => {}}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
