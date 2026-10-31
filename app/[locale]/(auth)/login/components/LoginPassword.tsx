import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import PasswordInput from "@/app/components/auth/PasswordInput"
import { PASSWORD_MAX_LENGTH } from "@/app/lib/validation/password"

type LoginPasswordProps = {
  value: string;
  error: string;
  submitError: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onBack: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

export default function LoginPassword({
  value,
  error,
  submitError,
  onChange,
  onBlur,
  onBack,
  onSubmit,
  isSubmitting,
}: LoginPasswordProps) {
  const t = useTranslations("auth.login.passwordStep")

  return (
    <>
      <form className="mt-12 w-full" onSubmit={onSubmit} noValidate>
        <label htmlFor="login-password" className="block text-sm font-medium">
          {t("passwordLabel")} <span className="text-gdg-red">*</span>
        </label>
        <div className="w-full">
          <PasswordInput
            id="login-password"
            name="password"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            minLength={8}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-invalid={Boolean(error)}
            aria-describedby={
              [
                error ? "login-password-error" : "",
                submitError ? "login-password-request-error" : "",
              ].filter(Boolean).join(" ") || undefined
            }
            className="mt-1.5 h-9 rounded-md border border-foreground/15 px-2.75 text-base outline-none placeholder:text-foreground/40"
          />
          <AuthErrorMessage
            id="login-password-error"
            message={error}
            className="mt-1 block"
          />
          <AuthErrorMessage
            id="login-password-request-error"
            message={submitError}
            className="mt-1 block"
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-blue hover:text-blue/90 active:text-blue/80">
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 h-8.75 w-full cursor-pointer rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80 disabled:cursor-not-allowed disabled:bg-blue/70"
        >
          {isSubmitting ? t("signingIn") : t("signIn")}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-16 mb-8 h-8.75 w-26.5 self-start rounded-[5px] bg-blue/65 text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/75 active:bg-blue/85"
      >
        {t("back")}
      </button>
    </>
  );
}
