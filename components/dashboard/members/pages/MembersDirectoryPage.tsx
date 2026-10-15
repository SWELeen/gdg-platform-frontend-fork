"use client";

import { useId, useState } from "react";
import type { ReactElement } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Phone, Search, UsersRound } from "lucide-react";
import { FaGithub, FaGlobe, FaLinkedinIn } from "react-icons/fa6";

import { directoryMembers } from "@/components/dashboard/members/members-directory-mock-data";
import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { PILL_SHAPE } from "@/components/dashboard/members/task-styles";
import { MemberProfileDialog } from "@/components/dashboard/members/MemberProfileDialog";

const memberTones = [
  "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]",
  "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]",
  "bg-[var(--dashboard-yellow-bg)] text-[var(--dashboard-yellow-text)]",
  "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]",
];

const socialPlatforms = [
  { key: "github", name: "GitHub", icon: FaGithub },
  { key: "linkedin", name: "LinkedIn", icon: FaLinkedinIn },
  { key: "website", name: "Website", icon: FaGlobe },
] as const;

export function MembersDirectoryPage(): ReactElement {
  const t = useTranslations("dashboard.directory");
  const locale = useLocale() === "ar" ? "ar" : "en";
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const visibleMembers = directoryMembers
    .filter((member) => member.name.toLocaleLowerCase(locale).includes(normalizedQuery))
    .sort((first, second) => Number(second.isTeamLead) - Number(first.isTeamLead));
  const selectedMember = directoryMembers.find((member) => member.id === selectedMemberId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]">
          <UsersRound aria-hidden="true" className="size-5" />
        </span>
        <p className="min-w-0 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t("searchLabel")}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full rounded-xl border border-border bg-surface ps-10 pe-4 text-sm text-foreground placeholder:text-muted focus-visible:border-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/30"
        />
      </div>

      <div className="flex">
        <span className="inline-flex items-center rounded-full bg-[var(--dashboard-blue-bg)] px-4 py-1.5 text-sm font-medium text-[var(--dashboard-blue-text)]">
          {t("myTeam")}
        </span>
      </div>

      <p role="status" className="sr-only">
        {t("resultsCount", { count: visibleMembers.length })}
      </p>

      {visibleMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center text-sm text-muted">
          {normalizedQuery ? t("emptySearch") : t("empty")}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member) => {
            const tone = memberTones[directoryMembers.indexOf(member) % memberTones.length];
            const role = member.isTeamLead ? t("teamLead") : member.role[locale];
            const cardTone = member.isTeamLead
              ? "border-gdg-blue/60 bg-[var(--dashboard-blue-bg)]/20"
              : "border-border bg-surface";

            return (
              <li key={member.id} className="h-full">
                <article
                  className={`relative flex h-full min-h-[250px] flex-col rounded-2xl border p-5 transition-colors hover:border-gdg-blue/50 hover:bg-[var(--dashboard-blue-bg)]/20 ${cardTone}`}
                >
                  <button
                    type="button"
                    aria-label={t("openProfile", { name: member.name })}
                    onClick={() => setSelectedMemberId(member.id)}
                    className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gdg-blue"
                  />

                  <div className="pointer-events-none relative z-10 flex items-start gap-3 pe-7">
                    <span
                      aria-hidden="true"
                      className={`flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${tone}`}
                    >
                      {member.initials}
                    </span>
                    <div className="flex min-w-0 flex-col items-start gap-1.5">
                      <h2 className="w-full truncate text-sm font-semibold text-foreground">{member.name}</h2>
                      <TaskBadge
                        className={`${PILL_SHAPE} max-w-full py-0.5 ${
                          member.isTeamLead
                            ? "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]"
                            : tone
                        }`}
                      >
                        <span className="truncate">{role}</span>
                      </TaskBadge>
                    </div>
                  </div>

                  <ChevronRight
                    aria-hidden="true"
                    className="pointer-events-none absolute end-4 top-5 z-10 size-4 text-gdg-blue rtl:rotate-180"
                  />

                  <p className="pointer-events-none relative z-10 mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted">
                    {member.bio[locale]}
                  </p>

                  <a
                    href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                    aria-label={t("callMember", { name: member.name })}
                    className="relative z-20 mt-3 inline-flex w-fit items-center gap-2 rounded-sm text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
                  >
                    <Phone aria-hidden="true" className="size-4 shrink-0" />
                    <span dir="ltr">{member.phone}</span>
                  </a>

                  <div className="relative z-20 mt-auto flex items-center gap-2.5 pt-4">
                    {socialPlatforms.map(({ key, name, icon: Icon }) => (
                      <a
                        key={key}
                        href={member.socialLinks[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("socialLink", { platform: name, name: member.name })}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-gdg-blue/50 hover:text-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
                      >
                        <Icon aria-hidden="true" className="size-4" />
                      </a>
                    ))}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {selectedMember && (
        <MemberProfileDialog member={selectedMember} onClose={() => setSelectedMemberId(null)} />
      )}
    </div>
  );
}
