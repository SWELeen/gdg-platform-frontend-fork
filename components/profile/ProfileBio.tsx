import { useTranslations } from "next-intl";

      type ProfileBioProps = {
  bio: string;
  placeholder: string;
  isEditing: boolean;
  onChange: (value: string) => void;
};

export function ProfileBio({
  bio,
  placeholder,
  isEditing,
  onChange,
}: ProfileBioProps) {
  const t = useTranslations("profile.bio");

  return (
<div className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm transition-colors duration-200 focus-within:border-[#243b64] focus-within:ring-2 focus-within:ring-[#243b64]/15 dark:border-[#243b64]/70 dark:bg-surface dark:text-slate-100 sm:p-6">      <p className="mb-1 text-base font-semibold text-[#243b64]">
        {t("title")}
      </p>
      {isEditing ? (
        <textarea
          value={bio}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-md bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#4285f4]/40 sm:text-base"
        />
      ) : (
        <p
          className={`text-sm leading-relaxed sm:text-base md:text-lg ${
            bio ? "text-foreground" : "text-gray-300 dark:text-white"
          }`}
        >
          {bio || t("empty")}
        </p>
      )}
    </div>
  );
}
