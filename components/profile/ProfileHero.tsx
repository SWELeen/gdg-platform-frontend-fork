"use client";

import { motion } from "framer-motion";
import { Check, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/Avatar";
import { ImageUploadButton } from "@/components/ui/ImageUploadButton";
import { ProfileChips } from "@/components/profile/ProfileChips";


type ProfileHeroProps = {
  
  initials: string;
  name: string;
  email: string;
  chips: string[];
  memberSince: string;
  avatarUrl: string | null;
  headerImageUrl: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarSelect: (file: File) => void;
  onHeaderImageSelect: (file: File) => void;
  /** Classes for the block under the cover, e.g. to leave room beside it. */
  contentClassName?: string;
};

export function ProfileHero({
  initials,
  name,
  email,
  chips,
  memberSince,
  avatarUrl,
  headerImageUrl,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onAvatarSelect,
  onHeaderImageSelect,
  contentClassName = "",
}: ProfileHeroProps) {
  const t = useTranslations("profile.hero");
 const editControls = isEditing ? (
  <div className="flex shrink-0 items-center gap-2">
 <button
  type="button"
  onClick={onCancel}
  className="rounded-md border border-[#4285f4] bg-white px-4 py-2 text-sm font-medium text-[#325fa6] shadow-sm transition-colors hover:bg-[#eaf2ff] hover:text-[#243b64] dark:bg-surface dark:text-white dark:hover:bg-[#243b64] dark:hover:text-white"
>
  {t("cancel")}
</button>

    <button
      type="button"
      onClick={onSave}
      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#4285f4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#325fa6]"
    >
      <Check className="size-3.5" />
      {t("save")}
    </button>
  </div>
) : (
  <button
  type="button"
  onClick={onEdit}
  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#4285f4] bg-white/90 px-4 py-2 text-sm font-medium text-[#325fa6] shadow-sm transition-colors hover:bg-[#eaf2ff] dark:bg-surface dark:text-white dark:hover:bg-[#243b64]"
>
  <SquarePen className="size-3.5" />
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
    {/* Cover */}
    <div
      className="relative h-32 overflow-hidden bg-gradient-to-r from-[#4285F4] via-[#C3ECF6] via-[#FFE7A5] to-[#EA4335] bg-cover bg-center sm:h-36 md:h-40 dark:bg-[linear-gradient(90deg,#356FC4_0%,#6FAFC4_35%,#D4B76B_65%,#D9786D_100%)]"
      style={
        headerImageUrl
          ? { backgroundImage: `url(${headerImageUrl})` }
          : undefined
      }
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

    {/* Profile information below cover */}
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 lg:px-16">
      <div className={`relative -mt-10 flex flex-col items-center text-center sm:-mt-12 md:items-start md:text-start ${contentClassName}`}>

        {/* Avatar overlapping the cover */}
        <div className="relative z-10">
          {avatarWithUpload}
        </div>

        {/* Name and member details */}
        <div className="mt-3 flex w-full flex-col gap-1">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#243b64] dark:text-slate-100 md:text-4xl">
            {name}
          </h1>

        <p className="text-base leading-relaxed text-foreground/75">
  {email} · {t("memberSince", { date: memberSince })}
</p>
        </div>

        {/* Chips and edit controls */}
        <div className="mt-3 flex w-full flex-col items-center gap-3 md:flex-row md:justify-between">
          <ProfileChips chips={chips} />

          <div className="shrink-0">
            {editControls}
          </div>
        </div>
      </div>
    </div>

    <div className="h-3 sm:h-4 md:h-5" />
  </motion.section>
);

}