"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GraduationCap, Landmark, Phone, X } from "lucide-react";
import { FaGithub, FaGlobe, FaLinkedinIn } from "react-icons/fa6";

import type { DirectoryMember } from "@/components/dashboard/members/members-directory-mock-data";
import { TaskBadge } from "@/components/dashboard/members/TaskBadge";
import { PILL_SHAPE } from "@/components/dashboard/members/task-styles";

const socialPlatforms = [
  { key: "github", name: "GitHub", icon: FaGithub },
  { key: "linkedin", name: "LinkedIn", icon: FaLinkedinIn },
  { key: "website", name: "Website", icon: FaGlobe },
] as const;

export function MemberProfileDialog({
  member,
  onClose,
}: {
  member: DirectoryMember;
  onClose: () => void;
}): ReactElement {
  const t = useTranslations("dashboard.directory");
  const locale = useLocale() === "ar" ? "ar" : "en";
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("profileTitle")}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[600px] flex-col overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/40"
    >
      <div className="relative px-7 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-10">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("closeProfile")}
          className="absolute end-5 top-5 inline-flex size-9 items-center justify-center rounded-full bg-surface-muted/70 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue sm:end-7 sm:top-7"
        >
          <X aria-hidden="true" className="size-4" />
        </button>

        <div className="flex items-center gap-3 pe-9 sm:gap-5">
          <span
            aria-hidden="true"
            className={`flex size-[76px] shrink-0 items-center justify-center rounded-full text-2xl font-semibold ${
              member.isTeamLead
                ? "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]"
                : "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]"
            }`}
          >
            {member.initials}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-foreground">{member.name}</h2>
              <TaskBadge
                className={`${PILL_SHAPE} mt-1 py-0.5 ${
                  member.isTeamLead
                    ? "bg-[var(--dashboard-green-bg)] text-[var(--dashboard-green-text)]"
                    : "bg-[var(--dashboard-blue-bg)] text-[var(--dashboard-blue-text)]"
                }`}
              >
                {member.isTeamLead ? t("teamLead") : member.role[locale]}
              </TaskBadge>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <a
                href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                className="flex w-fit items-center gap-2 rounded-sm text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
              >
                <Phone aria-hidden="true" className="size-4 shrink-0" />
                <span dir="ltr">{member.phone}</span>
              </a>
              <div className="flex items-center gap-2.5">
                {socialPlatforms.map(({ key, name, icon: Icon }) => (
                  <a
                    key={key}
                    href={member.socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("socialLink", { platform: name, name: member.name })}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-gdg-blue/50 hover:text-gdg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
                  >
                    <Icon aria-hidden="true" className="size-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-border px-7 py-6 sm:px-10 sm:py-7">
        <h3 className="text-[17px] font-semibold text-foreground">{t("profile.about")}</h3>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-6 text-muted">{member.bio[locale]}</p>
      </section>

      <section className="border-t border-border px-7 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-7">
        <h3 className="text-[17px] font-semibold text-foreground">{t("profile.academicInfo")}</h3>
        <dl className="mt-4 space-y-3">
          <div className="flex items-center gap-4 text-[15px]">
            <Landmark aria-hidden="true" className="size-4 shrink-0 text-muted" />
            <dt className="min-w-16 text-muted">{t("profile.university")}</dt>
            <dd className="text-foreground">{member.university[locale]}</dd>
          </div>
          <div className="flex items-center gap-4 text-[15px]">
            <GraduationCap aria-hidden="true" className="size-4 shrink-0 text-muted" />
            <dt className="min-w-16 text-muted">{t("profile.major")}</dt>
            <dd className="text-foreground">{member.major[locale]}</dd>
          </div>
        </dl>
      </section>
    </dialog>
  );
}
