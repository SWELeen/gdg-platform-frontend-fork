"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/Avatar";

type ProfileHeroProps = {
  initials: string;
  name: string;
  email: string;
  memberSince: string | null;
  avatarUrl: string | null;
  /** Classes for the block under the cover, e.g. to leave room beside it. */
  contentClassName?: string;
};

export function ProfileHero({ initials, name, email, memberSince, avatarUrl, contentClassName = "" }: ProfileHeroProps) {
  const t = useTranslations("profile.hero");
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="h-32 bg-[image:linear-gradient(90deg,var(--gdg-blue)_0%,var(--gdg-blue-light)_50%,var(--gdg-red)_100%)] sm:h-36 md:h-40 dark:bg-[image:var(--profile-cover-gradient-dark)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 lg:px-16">
        <div className={`relative -mt-10 flex flex-col items-center text-center sm:-mt-12 md:items-start md:text-start ${contentClassName}`}>
          <Avatar initials={initials} imageUrl={avatarUrl} size="lg" />
          <div className="mt-3 flex w-full flex-col gap-1">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--profile-navy-ink)] dark:text-[var(--profile-title-dark)] md:text-4xl">
              {name}
            </h1>
            <p className="text-base leading-relaxed text-foreground/75">
              {email}
              {memberSince && <> · {t("memberSince", { date: memberSince })}</>}
            </p>
          </div>
        </div>
      </div>
      <div className="h-3 sm:h-4 md:h-5" />
    </motion.section>
  );
}
