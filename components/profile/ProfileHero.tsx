"use client";

import { motion } from "framer-motion";
import { SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ImageUploadButton } from "@/components/ui/ImageUploadButton";

type ProfileHeroProps = {
  initials: string;
  name: string;
  email: string;
  memberSince: string;
  avatarUrl: string | null;
  headerImageUrl: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarSelect: (file: File) => void;
  onHeaderImageSelect: (file: File) => void;
};

export function ProfileHero({
  initials,
  name,
  email,
  memberSince,
  avatarUrl,
  headerImageUrl,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onAvatarSelect,
  onHeaderImageSelect,
}: ProfileHeroProps) {
  const t = useTranslations("profile.hero");
  const editControls = isEditing ? (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:text-base"
      >
        {t("cancel")}
      </button>
      <Button variant="solid" onClick={onSave}>
        {t("save")}
      </Button>
    </div>
  ) : (
   <button
  type="button"
  onClick={onEdit}
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#325fa6] bg-white px-5 py-2.5 font-semibold text-[#325fa6] shadow-sm transition-all duration-200 hover:bg-[#eaf2ff] dark:border-[#243b64]/70 dark:bg-surface dark:text-white dark:hover:brightness-110"
>
  <SquarePen className="size-4 sm:size-5" />
  {t("edit")}
</button>
  );

  const avatarWithUpload = (
    <div className="relative shrink-0">
      <Avatar initials={initials} imageUrl={avatarUrl} size="lg" />
      {isEditing && (
        <ImageUploadButton
          onSelect={onAvatarSelect}
          label={t("changePhoto")}
          className="absolute bottom-1 end-1 size-9 sm:size-10"
          iconClassName="size-4 sm:size-5"
        />
      )}
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="relative h-28 overflow-hidden rounded-t-3xl bg-gradient-to-r from-[#325fa6] via-[#4285f4] to-[#c9e3ee] bg-cover bg-center sm:h-32 md:h-36 lg:h-40"
        style={headerImageUrl ? { backgroundImage: `url(${headerImageUrl})` } : undefined}
      >
        {isEditing && (
          <ImageUploadButton
            onSelect={onHeaderImageSelect}
            label={t("changeCover")}
            className="absolute end-4 top-4 size-10 sm:end-6 sm:top-6"
            iconClassName="size-5"
          />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="-mt-8 sm:-mt-10 md:-mt-12">
          {/* Mobile: centered, stacked */}
          <div className="flex flex-col items-center gap-2 text-center md:hidden">
            {avatarWithUpload}
            <div className="flex flex-col items-center gap-1">
             <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#243b64]"> 
                {name}
              </h1>
              <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
                {email} · {t("memberSince", { date: memberSince })}
              </p>
            </div>
            {editControls}
          </div>

          {/* Desktop: avatar + button share a row, name/meta start-aligned below */}
          <div className="hidden md:flex md:flex-col md:gap-3">
            <div className="flex items-end justify-between">
              {avatarWithUpload}
              {editControls}
            </div>
            <div className="flex flex-col items-start gap-1 text-start">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#243b64]">
                {name}
              </h1>
              <p className="text-lg leading-relaxed text-foreground/75">
                {email} · {t("memberSince", { date: memberSince })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-3 sm:h-4 md:h-5" />
    </motion.section>
  );
}
