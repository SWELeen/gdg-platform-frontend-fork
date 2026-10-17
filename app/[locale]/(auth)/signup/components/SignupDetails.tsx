import { useTranslations } from "next-intl"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import { collegeOptions, majorOptions } from "@/data/signup"
import SelectField from "./SelectField"

type SignupDetailsProps = {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
  onBack: () => void;
  formError: string;
  isSubmitting: boolean;
};

export default function SignupDetails({
  values,
  errors,
  onChange,
  onBlur,
  onBack,
  formError,
  isSubmitting,
}: SignupDetailsProps) {
  const t = useTranslations("auth.signup")

  return (
    <>
      <label
        htmlFor="university"
        className="relative block text-sm font-medium"
      >
        {t("fields.university.label")} <span className="text-gdg-red">*</span>
        <input
          id="university"
          name="university"
          type="text"
          value={values.university}
          onChange={(event) => onChange("university", event.target.value)}
          onBlur={() => onBlur("university")}
          placeholder={t("fields.university.placeholder")}
          maxLength={255}
          aria-invalid={Boolean(errors.university)}
          aria-describedby={
            errors.university ? "university-error" : undefined
          }
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            errors.university
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="university-error"
          message={errors.university ?? ""}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <label
        htmlFor="university-id"
        className="relative block text-sm font-medium"
      >
        {t("fields.universityId.label")} <span className="text-gdg-red">*</span>
        <input
          id="university-id"
          name="universityId"
          type="text"
          value={values.universityId}
          onChange={(event) => onChange("universityId", event.target.value)}
          onBlur={() => onBlur("universityId")}
          placeholder={t("fields.universityId.placeholder")}
          maxLength={255}
          aria-invalid={Boolean(errors.universityId)}
          aria-describedby={
            errors.universityId ? "university-id-error" : undefined
          }
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            errors.universityId
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="university-id-error"
          message={errors.universityId ?? ""}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <SelectField
        id="college"
        label={t("fields.college.label")}
        placeholder={t("fields.college.placeholder")}
        options={collegeOptions.map((value) => ({ value, label: value }))}
        value={values.college}
        error={errors.college}
        onChange={(value) => onChange("college", value)}
        onBlur={() => onBlur("college")}
      />

      <SelectField
        id="major"
        label={t("fields.major.label")}
        placeholder={t("fields.major.placeholder")}
        options={majorOptions.map((value) => ({ value, label: value }))}
        value={values.major}
        error={errors.major}
        onChange={(value) => onChange("major", value)}
        onBlur={() => onBlur("major")}
      />

      {/* Absolutely positioned, matching step 1: no reserved height. */}
      <div className="relative col-span-full h-0">
        <AuthErrorMessage
          message={formError}
          className="absolute inset-x-0 top-1 text-center"
        />
      </div>

      <div className="col-span-full mt-3 mb-3 flex w-full flex-col gap-3 lg:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="h-8.75 w-full rounded-[5px] border border-blue text-sm font-medium text-blue transition-colors duration-200 hover:bg-blue/10 active:bg-blue/20"
        >
          {t("back")}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80 disabled:cursor-not-allowed disabled:bg-blue/70"
        >
          {isSubmitting ? t("creatingAccount") : t("createAccount")}
        </button>
      </div>
    </>
  );
}
