"use client";

import { HangingBadge } from "@/components/badge/HangingBadge";
import { useMemberBadge } from "@/components/badge/useMemberBadge";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { ProfileBio } from "@/components/profile/ProfileBio";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { RegistrationsLink } from "@/components/profile/RegistrationsLink";
import { demoMemberGender, demoMemberProfile, demoMembership } from "@/data/demo-member";
import { findRowValue, useProfileEditor } from "@/lib/useProfileEditor";

// Committee members get a 3D badge in a column beside the cards, hanging from
// the cover and staying in view while the page scrolls; on phones it sits
// between the header and the cards. Anyone else gets the page without it.
// To connect the backend, replace the three demo imports with the signed-in
// member's profile, gender and committee membership.
export default function ProfilePage({ }: PageProps<"/[locale]/profile">) {
  const { hero, bio, tabs, saved } = useProfileEditor(demoMemberProfile);
  const badge = useMemberBadge({
    name: findRowValue(saved.personalData, "fullName") || demoMemberProfile.profile.name,
    university: findRowValue(saved.academicData, "university"),
    photoUrl: saved.avatarUrl,
    gender: demoMemberGender,
    membership: demoMembership,
  });

  return (
    <div className="flex flex-1 flex-col overflow-x-clip bg-background text-foreground">
      <TopNav />

      <ProfileHero {...hero} contentClassName={badge ? "md:pe-[19rem] lg:pe-[20rem]" : ""} />

      <main
        className={`mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 sm:py-6 md:gap-4 md:px-10 md:pt-3 md:pb-8 lg:px-16 ${
          badge ? "md:grid md:grid-cols-[minmax(0,1fr)_17rem] md:content-start md:gap-x-8 lg:grid-cols-[minmax(0,1fr)_18rem]" : ""
        }`}
      >
        {badge && (
          <HangingBadge
            {...badge}
            className="h-[26rem] md:sticky md:top-24 md:col-start-2 md:row-span-3 md:row-start-1 md:-mt-[18rem] md:h-[38rem]"
            stageClassName="top-0 -bottom-40 md:-top-[6.75rem] md:-bottom-[26rem]"
            spanViewport
            desktop={{ fit: 0.66, fitW: 0.86 }}
            phone={{ fit: 0.8, fitW: 0.62 }}
          />
        )}
        <div className="md:col-start-1 md:row-start-1">
          <RegistrationsLink />
        </div>
        <div className="md:col-start-1">
          <ProfileBio {...bio} />
        </div>
        <div className="min-w-0 md:col-start-1">
          <ProfileTabs {...tabs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
