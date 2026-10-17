import { useTranslations } from "next-intl"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import PasswordInput from "@/app/components/auth/PasswordInput"
import { genderOptions, phoneCountryCodeOptions } from "@/data/signup"
import SelectField from "./SelectField"

type SignupCredentialsProps = {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
  formError: string;
};

export default function SignupCredentials({
  values,
  errors,
  onChange,
  onBlur,
  formError,
}: SignupCredentialsProps) {
  const t = useTranslations("auth.signup")
  const fullNameError = errors.fullName ?? ""
  const emailError = errors.personalEmail ?? ""
  const confirmEmailError = errors.confirmEmail ?? ""
  const universityEmailError = errors.universityEmail ?? ""
  const passwordError = errors.password ?? ""
  const confirmPasswordError = errors.confirmPassword ?? ""
  const phoneError = errors.phone ?? ""

  return (
    <>
      <label
        htmlFor="full-name"
        className="relative order-1 block text-sm font-medium"
      >
        {t("fields.fullName.label")} <span className="text-gdg-red">*</span>
        <input
          id="full-name"
          name="fullName"
          type="text"
          value={values.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          onBlur={() => onBlur("fullName")}
          placeholder={t("fields.fullName.placeholder")}
          autoComplete="name"
          maxLength={255}
          aria-invalid={Boolean(fullNameError)}
          aria-describedby={fullNameError ? "full-name-error" : undefined}
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            fullNameError
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="full-name-error"
          message={fullNameError}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <SelectField
        id="gender"
        label={t("fields.gender.label")}
        placeholder={t("fields.gender.placeholder")}
        options={genderOptions.map(({ value, labelKey }) => ({
          value,
          label: t(`options.gender.${labelKey}`)
        }))}
        className="order-2"
        value={values.gender}
        error={errors.gender}
        onChange={(value) => onChange("gender", value)}
        onBlur={() => onBlur("gender")}
      />

      <label
        htmlFor="personal-email"
        className="relative order-3 block text-sm font-medium"
      >
        {t("fields.personalEmail.label")} <span className="text-gdg-red">*</span>
        <input
          id="personal-email"
          name="personalEmail"
          type="email"
          value={values.personalEmail}
          onChange={(event) => onChange("personalEmail", event.target.value)}
          onBlur={() => onBlur("personalEmail")}
          placeholder={t("fields.personalEmail.placeholder")}
          autoComplete="email"
          maxLength={254}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "personal-email-error" : undefined}
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            emailError
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="personal-email-error"
          message={emailError}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <label
        htmlFor="password"
        className="relative order-5 block text-sm font-medium"
      >
        {t("fields.password.label")} <span className="text-gdg-red">*</span>
        <PasswordInput
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={(event) => onChange("password", event.target.value)}
          onBlur={() => onBlur("password")}
          placeholder={t("fields.password.placeholder")}
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "password-error" : undefined}
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            passwordError
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="password-error"
          message={passwordError}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <label
        htmlFor="confirm-email"
        className="relative order-4 block text-sm font-medium"
      >
        {t("fields.confirmEmail.label")} <span className="text-gdg-red">*</span>
        <input
          id="confirm-email"
          name="confirmEmail"
          type="email"
          value={values.confirmEmail}
          onChange={(event) => onChange("confirmEmail", event.target.value)}
          onBlur={() => onBlur("confirmEmail")}
          placeholder={t("fields.confirmEmail.placeholder")}
          autoComplete="email"
          maxLength={254}
          aria-invalid={Boolean(confirmEmailError)}
          aria-describedby={
            confirmEmailError ? "confirm-email-error" : undefined
          }
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            confirmEmailError
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="confirm-email-error"
          message={confirmEmailError}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <label
        htmlFor="confirm-password"
        className="relative order-6 block text-sm font-medium"
      >
        {t("fields.confirmPassword.label")} <span className="text-gdg-red">*</span>
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={(event) =>
            onChange("confirmPassword", event.target.value)
          }
          onBlur={() => onBlur("confirmPassword")}
          placeholder={t("fields.confirmPassword.placeholder")}
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          aria-invalid={Boolean(confirmPasswordError)}
          aria-describedby={
            confirmPasswordError ? "confirm-password-error" : undefined
          }
          className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-base font-normal outline-none placeholder:text-foreground/40 ${
            confirmPasswordError
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        />

        <AuthErrorMessage
          id="confirm-password-error"
          message={confirmPasswordError}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      <label
        htmlFor="phone"
        className="relative order-7 block text-sm font-medium"
      >
        {t("fields.phone.label")}
        {/* Phone numbers read left to right in every language, so this box never mirrors. */}
        <span
          dir="ltr"
          className={`mt-1.5 flex h-8 items-center rounded-md border text-base font-normal ${
            phoneError
              ? "border-gdg-red"
              : "border-foreground/15"
          }`}
        >
          <span className="relative h-full border-e border-foreground/15">
            <select
              id="country-code"
              name="countryCode"
              value={values.countryCode}
              onChange={(event) => onChange("countryCode", event.target.value)}
              aria-label={t("fields.phone.countryCode")}
              className="h-full appearance-none rounded-s-md bg-surface px-2.75 pe-6 text-base font-normal outline-none"
            >
              {phoneCountryCodeOptions.map(({ code }) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-e-2 top-1/2 -translate-y-1/2 text-xs">
              ⌄
            </span>
          </span>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            onBlur={() => onBlur("phone")}
            placeholder={t("fields.phone.placeholder")}
            maxLength={15}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? "phone-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-2.75 outline-none placeholder:text-foreground/40"
          />
        </span>

        <AuthErrorMessage
          id="phone-error"
          message={phoneError}
          className="absolute start-0 top-full mt-0.5"
        />
      </label>

      {/* Fixed slot so the submit button doesn't jump when the message animates. */}
      {/* Absolutely positioned so the slot costs no height: the message sits in the
          gap under the last row instead of reserving a line. */}
      <div className="relative order-8 col-span-full h-0">
        <AuthErrorMessage
          message={formError}
          className="absolute inset-x-0 -top-4 text-center"
        />
      </div>

      <button
        type="submit"
        className="order-9 col-span-full -mt-4 mb-1 h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80"
      >
        {t("continue")}
      </button>
    </>
  );
}
