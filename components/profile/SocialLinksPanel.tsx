"use client";

import { motion } from "framer-motion";
import { Check, Link2, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SocialLinkRow } from "@/components/profile/SocialLinkRow";
import type { SocialLink } from "@/data/profile";

type SocialLinksPanelProps = {
  links: SocialLink[];
  isEditing: boolean;
  values: Record<SocialLink["platform"], string>;
  errors: Record<SocialLink["platform"], string | null>;
  isSaving: boolean;
  error: string;
  saved: boolean;
  onChange: (platform: SocialLink["platform"], value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function SocialLinksPanel({
  links,
  isEditing,
  values,
  errors,
  isSaving,
  error,
  saved,
  onChange,
  onEdit,
  onSave,
  onCancel,
}: SocialLinksPanelProps) {
  const t = useTranslations("profile.social");
  const tb = useTranslations("profile.bio");

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--navy)] dark:text-slate-100">{t("title")}</h3>
          {!isEditing && (
            <button type="button" onClick={onEdit} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#325fa6] transition-colors hover:bg-[#4285f4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] dark:text-[#8ab4f8]">
              <Pencil className="size-4" aria-hidden="true" />
              {tb("edit")}
            </button>
          )}
        </div>

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
        {isEditing && (
          <>
            {error && <p role="alert" className="mt-3 text-sm text-gdg-red">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={onSave} disabled={isSaving || Object.values(errors).some(Boolean)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#4285f4] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3367d6] disabled:cursor-not-allowed disabled:opacity-60">
                <Check className="size-4" aria-hidden="true" />
                {tb(isSaving ? "saving" : "save")}
              </button>
              <button type="button" onClick={onCancel} disabled={isSaving} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/5">
                <X className="size-4" aria-hidden="true" />
                {tb("cancel")}
              </button>
            </div>
          </>
        )}
        {!isEditing && saved && <p role="status" className="mt-3 text-sm text-green-700 dark:text-green-400">{t("saved")}</p>}
      </div>
    </div>
  );
}
