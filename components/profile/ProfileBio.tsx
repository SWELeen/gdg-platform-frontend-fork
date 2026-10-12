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
    <div className="w-full rounded-card border border-[#243b64]/70 bg-surface px-4 py-4 transition-colors duration-200 focus-within:border-[#243b64] focus-within:ring-2 focus-within:ring-[#243b64]/15 sm:px-6">
      <p className="mb-1 text-base font-semibold text-[#243b64]">
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
          {bio || placeholder}
        </p>
      )}
    </div>
  );
}