import { useTranslations } from "next-intl";
import { Check, Pencil, X } from "lucide-react";

type ProfileBioProps = {
  bio: string;
  isSaving: boolean;
  error: string;
  saved: boolean;
  placeholder: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ProfileBio({
  bio,
  placeholder,
  isEditing,
  isSaving,
  error,
  saved,
  onChange,
  onEdit,
  onSave,
  onCancel,
}: ProfileBioProps) {
  const t = useTranslations("profile.bio");

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm transition-colors duration-200 focus-within:border-[#243b64] focus-within:ring-2 focus-within:ring-[#243b64]/15 dark:border-[#243b64]/70 dark:bg-surface dark:text-slate-100 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-[#243b64] dark:text-slate-100">
          {t("title")}
        </p>
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#325fa6] transition-colors hover:bg-[#4285f4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] dark:text-[#8ab4f8]"
          >
            <Pencil className="size-4" aria-hidden="true" />
            {t("edit")}
          </button>
        )}
      </div>
      {isEditing ? (
        <>
          <textarea
            value={bio}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={500}
            aria-label={t("title")}
            aria-describedby={error ? "profile-bio-error" : undefined}
            className="w-full resize-none rounded-md bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#4285f4]/40 sm:text-base"
          />
          {error && (
            <p id="profile-bio-error" role="alert" className="mt-2 text-sm text-gdg-red">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#4285f4] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3367d6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="size-4" aria-hidden="true" />
              {t(isSaving ? "saving" : "save")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/5"
            >
              <X className="size-4" aria-hidden="true" />
              {t("cancel")}
            </button>
          </div>
        </>
      ) : (
        <>
          <p
            className={`text-sm leading-relaxed sm:text-base md:text-lg ${
              bio ? "text-foreground" : "text-gray-300 dark:text-white"
            }`}
          >
            {bio || t("empty")}
          </p>
          {saved && (
            <p role="status" className="mt-2 text-sm text-green-700 dark:text-green-400">
              {t("saved")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
