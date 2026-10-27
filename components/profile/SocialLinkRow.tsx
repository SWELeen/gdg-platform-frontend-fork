"use client";

import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { GithubMark, XMark } from "@/components/layout/BrandMarks";
import type { SocialLink } from "@/data/profile";

const iconBadgeByPlatform = {
  github: { icon: GithubMark, className: "bg-[var(--black)] text-[var(--white)]" },
  x: { icon: XMark, className: "bg-[var(--black)] text-[var(--white)]" },
  portfolio: {
    icon: Globe,
    className: "bg-surface text-website-green ring-1 ring-gray-350",
  },
} as const;

const placeholderByPlatform = {
  github: "https://github.com/your-username",
  x: "https://x.com/your-username",
  portfolio: "https://your-portfolio.com",
} as const;

type SocialLinkRowProps = {
  link: SocialLink;
  isEditing: boolean;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
};

export function SocialLinkRow({
  link,
  isEditing,
  value,
  error,
  onChange,
}: SocialLinkRowProps) {
  const t = useTranslations("profile.social");
  const tv = useTranslations("validation");
  const { icon: Icon, className: badgeClassName } =
    iconBadgeByPlatform[link.platform];

  return (
   <motion.li
  variants={{
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  }}
  className={`flex min-w-0 items-center gap-3 border-b py-4 first:pt-0 last:border-b-0 last:pb-0 ${
    error
      ? "border-gdg-red"
      : "border-gray-200 dark:border-[#243b64]/50"
  }`}
>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9 ${badgeClassName}`}
      >
        <Icon className="size-5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold text-foreground sm:text-sm">
          {t(`platforms.${link.platform}`)}
        </span>
        {isEditing ? (
          <>
            <input
              type="url"
              maxLength={2048}
              // URLs read left to right in every language.
              dir="ltr"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholderByPlatform[link.platform]}
              aria-invalid={Boolean(error)}
              className="w-full min-w-0 border-0 border-b border-dashed border-gray-350 bg-transparent py-0.5 text-xs text-foreground outline-none placeholder:text-gray-300 focus:border-accent-blue sm:text-sm"
            />
            {error && (
              <span className="mt-1 text-xs text-gdg-red">{tv(error)}</span>
            )}
          </>
        ) : link.value ? (
          <a
            href={link.value}
            target="_blank"
            dir="ltr"
            rel="noopener noreferrer"
            className="max-w-full self-start truncate text-xs text-accent-blue hover:underline sm:text-sm"
          >
            {link.value}
          </a>
        ) : (
          <span className="text-xs italic text-gray-300 sm:text-sm">
            {t("notAdded")}
          </span>
        )}
      </div>

      {!isEditing && link.value && (
  <a
    href={link.value}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Open ${link.platform} in a new tab`}
    className="inline-flex shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
  >
    <ExternalLink className="size-4 text-gray-500 sm:size-5" />
  </a>
)}
    </motion.li>
  );
}
