"use client";

import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SocialLinkRow } from "@/components/profile/SocialLinkRow";
import type { SocialLink } from "@/data/profile";

type SocialLinksPanelProps = {
  links: SocialLink[];
  isEditing: boolean;
  values: Record<SocialLink["platform"], string>;
  errors: Record<SocialLink["platform"], string | null>;
  onChange: (platform: SocialLink["platform"], value: string) => void;
};

export function SocialLinksPanel({
  links,
  isEditing,
  values,
  errors,
  onChange,
}: SocialLinksPanelProps) {
  const t = useTranslations("profile.tabs");

  return (
    <div className="flex w-full min-w-0 rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-[var(--navy)]/30 hover:shadow-lg dark:border-[#243b64]/70 dark:bg-surface dark:text-slate-100">

      {/* Accent sidebar */}
      <div className="flex w-12 shrink-0 justify-center rounded-s-2xl bg-[#4285f4] pt-5 sm:w-14 sm:pt-6">
        <Link2
          className="size-5 text-white"
          aria-hidden="true"
        />
      </div>

      {/* Social links content */}
      <div className="min-w-0 flex-1 p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--navy)] dark:text-slate-100">
          {t("social")}
        </h3>

        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05 },
            },
          }}
          className="flex flex-col"
        >
          {links.map((link) => (
            <SocialLinkRow
              key={link.platform}
              link={link}
              isEditing={isEditing}
              value={values[link.platform]}
              error={errors[link.platform]}
              onChange={(value) =>
                onChange(link.platform, value)
              }
            />
          ))}
        </motion.ul>
      </div>
    </div>
  );
}