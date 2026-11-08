import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"

type LoginEmailProps = {
  value: string;
  error: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onContinue: () => void;
};

export default function LoginEmail({
  value,
  error,
  onChange,
  onBlur,
  onContinue,
}: LoginEmailProps) {
  const t = useTranslations("auth.login.emailStep")

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
        className="mt-12 w-full"
        noValidate
      >
        <label htmlFor="email" className="block text-sm font-medium">
          {t("emailLabel")} <span className="text-gdg-red">*</span>
        </label>

        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            maxLength={254}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-email-error" : undefined}
            className="mt-1.5 h-9 w-full rounded-md border border-foreground/15 px-2.75 text-base outline-none placeholder:text-foreground/40"
          />

          <AuthErrorMessage
            id="login-email-error"
            message={error}
            className="absolute inset-s-0 top-full mt-1.5"
          />
        </div>

        <button
          type="submit"
          className="mt-6 h-8.75 w-full cursor-pointer rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80"
        >
          {t("continue")}
        </button>
        <div className="my-5 flex items-center gap-3.25 text-xs text-foreground/35">
          <span className="h-px flex-1 bg-foreground/15" />
          <span>{t("or")}</span>
          <span className="h-px flex-1 bg-foreground/15" />
        </div>

        <GoogleAuthButton />
      </form>
<p className="mt-2 pb-8 text-center text-sm text-foreground/55">
  {t("noAccount")}
  <Link
    href="/signup"
    className="ms-1 text-sm font-medium text-blue hover:text-blue/90 active:text-blue/80"
  >
    {t("createAccount")}
  </Link>
</p>
    </>
  );
}
