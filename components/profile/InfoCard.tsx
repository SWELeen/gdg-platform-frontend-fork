import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";
import type { InfoCardData } from "@/data/profile";
import { SAUDI_UNIVERSITIES } from "@/lib/constants/universities";
import {
  UserRound,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  BookOpen,
  CalendarDays,
} from "lucide-react";

type InfoCardProps = {
  data: InfoCardData;
  isEditing: boolean;
  values: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (key: string, value: string) => void;
};

function formatPhone(digits: string) {
  return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1 $2 $3").trim();
}

export function InfoCard({
  data,
  isEditing,
  values,
  errors,
  onChange,
}: InfoCardProps) {
  const t = useTranslations("profile");
  const tv = useTranslations("validation");

  return (
     <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--navy)]/30 hover:shadow-lg dark:border-[#243b64]/70 dark:bg-surface dark:text-slate-100 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--light-blue)]">
    {data.id === "personal" ? (
      <UserRound className="h-5 w-5 text-[var(--navy)]" />
    ) : (
      <GraduationCap className="h-5 w-5 text-[var(--navy)]" />
    )}
  </div>

  <h3 className="text-base font-semibold tracking-wide text-[var(--navy)] dark:text-slate-100 sm:text-lg">
    {t(`cards.${data.id}`)}
  </h3>
</div>
      <dl className="flex flex-col gap-3">
        {data.rows.map((row) => {
          const error = errors[row.key];
          const isPhone = row.key === "phone";
          const isUniversity = row.key === "university";

          return (
            <div
            key={row.key}
            className={`flex gap-3 ${
            isEditing
            ? "flex-col sm:flex-row sm:items-center sm:justify-between"
           : "items-baseline justify-between"
  }`}
>
  <dt className="shrink-0 text-xs text-gray-500 sm:text-sm">
    {t(`fields.${row.key}`)}
  </dt>
              
              {isEditing ? (
                <div className="flex min-w-0 flex-1 flex-col sm:items-end">
                  {isUniversity ? (
                    <Select
                      value={values[row.key] ?? ""}
                      options={SAUDI_UNIVERSITIES}
                      onChange={(value) => onChange(row.key, value)}
                      placeholder={t("universityPlaceholder")}
                      error={Boolean(error)}
                    />
                  ) : (
                    <div
                      // Phone numbers read left to right in every language, so this box never mirrors.
                      dir={isPhone ? "ltr" : undefined}
                      className={`flex min-w-0 items-baseline gap-1.5 border-0 border-b border-dashed py-0.5 ${
                        error ? "border-gdg-red" : "border-gray-350"
                      }`}
                    >
                      {isPhone && (
                        <span className="shrink-0 text-xs font-semibold text-gray-500 sm:text-sm">
                          +966
                        </span>
                      )}
                      <input
                        type="text"
                        inputMode={isPhone ? "numeric" : "text"}
                        value={values[row.key] ?? ""}
                        onChange={(event) => {
                          const raw = isPhone
                            ? event.target.value.replace(/\D/g, "").slice(0, 9)
                            : event.target.value;
                          onChange(row.key, raw);
                        }}
                        aria-invalid={Boolean(error)}
                        className="min-w-0 border-0 bg-transparent text-start text-xs font-semibold text-foreground outline-none sm:text-end sm:text-sm"
                      />
                    </div>
                  )}
                  {error && (
                    <span className="mt-1 text-xs text-gdg-red">{tv(error)}</span>
                  )}
                </div>
              ) : (
                <dd className="text-end text-xs font-semibold text-gray-800 dark:text-gray-100 sm:text-sm">
                  {isPhone ? (
                    <span dir="ltr">{`+966 ${formatPhone(row.value)}`}</span>
                  ) : (
                    row.value
                  )}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}