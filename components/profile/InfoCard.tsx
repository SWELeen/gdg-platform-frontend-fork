import { useTranslations } from "next-intl";
import { GraduationCap, UserRound } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { InfoCardData } from "@/data/profile";
import { SAUDI_UNIVERSITIES } from "@/lib/constants/universities";

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
  const academicTranslations: Record<string, string> = {
    "University of Jeddah": "universityOfJeddah",
    "Software Engineering": "softwareEngineering",
    "Third Year": "thirdYear",
    "Jana Alshaikh": "janaAlshaikh",
  };

  const getDisplayValue = (value: string) => {
    const translationKey = academicTranslations[value];

    if (!translationKey) return value;

    return t(
      `academicValues.${translationKey}` as
    | "academicValues.universityOfJeddah"
    | "academicValues.softwareEngineering"
    | "academicValues.thirdYear"
    | "academicValues.janaAlshaikh"
);
  };

  const isPersonal = data.id === "personal";

  return (
    <div className="flex min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-[var(--navy)]/30 hover:shadow-lg dark:border-[#243b64]/70 dark:bg-surface dark:text-slate-100">

      {/* Colored accent sidebar */}
      <div
        className={`flex w-12 shrink-0 justify-center rounded-s-2xl pt-5 sm:w-14 sm:pt-6 ${isPersonal ? "bg-[#4285f4]" : "bg-[#34a853]"
          }`}
      >
        {isPersonal ? (
          <UserRound
            className="size-5 text-white"
            aria-hidden="true"
          />
        ) : (
          <GraduationCap
            className="size-5 text-white"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Card content */}
      <div className="min-w-0 flex-1 p-4 sm:p-6">
        <h3 className="mb-5 text-lg font-semibold text-[var(--navy)] dark:text-slate-100">
          {t(`cards.${data.id}`)}
        </h3>

        <dl className="flex flex-col gap-3">
          {data.rows.map((row) => {
            const error = errors[row.key];
            const isPhone = row.key === "phone";
            const isUniversity = row.key === "university";

            return (
              <div
                key={row.key}
                className={`flex min-w-0 gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 dark:border-[#243b64]/50 ${isEditing
                    ? "flex-col sm:flex-row sm:items-center sm:justify-between"
                    : "items-baseline justify-between"
                  }`}
              >
                <dt className="shrink-0 text-sm text-gray-500 dark:text-slate-400">
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
                        dir={isPhone ? "ltr" : undefined}
                        className={`flex min-w-0 items-baseline gap-1.5 border-0 border-b border-dashed py-0.5 ${error
                            ? "border-gdg-red"
                            : "border-gray-350"
                          }`}
                      >
                        {isPhone ? (
                          <span dir="ltr">{`+966 ${formatPhone(row.value)}`}</span>
                        ) : (
                          getDisplayValue(row.value)
                        )}

                        <input
                          type="text"
                          inputMode={isPhone ? "numeric" : "text"}
                          value={values[row.key] ?? ""}
                          onChange={(event) => {
                            const raw = isPhone
                              ? event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 9)
                              : event.target.value;

                            onChange(row.key, raw);
                          }}
                          aria-invalid={Boolean(error)}
                          className="min-w-0 w-full border-0 bg-transparent text-start text-base font-semibold text-foreground outline-none sm:text-end"
                        />
                      </div>
                    )}

                    {error && (
                      <span className="mt-1 text-sm text-gdg-red">
                        {tv(error)}
                      </span>
                    )}
                  </div>
                ) : (
                  <dd className="min-w-0 break-words text-end text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {isPhone ? (
                      <span dir="ltr">
                        {`+966 ${formatPhone(row.value)}`}
                      </span>
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
    </div>
  );
}