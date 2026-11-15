"use client";

import { useTranslations } from "next-intl"
import { type FormEvent, useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth/better-auth-client"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import PasswordInput from "@/app/components/auth/PasswordInput"
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateConfirmPassword,
  validatePassword,
} from "@/app/lib/validation/password";

type ResetPasswordFormProps = {
  // Already-translated label; defaults to "Reset Password" in the current language.
  submitLabel?: string
}

function normalizeText(value: string) {
  return value.trim();
}

export default function ResetPasswordForm({
  submitLabel
}: ResetPasswordFormProps) {
  const t = useTranslations("auth.resetPassword")
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tokenHash, setTokenHash] = useState("")
  const [requestMessage, setRequestMessage] = useState("")

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const token = query.get("token")
    const timer = window.setTimeout(() => {
      if (token) {
        setTokenHash(token)
        window.history.replaceState(null, "", window.location.pathname)
      } else {
        setRequestMessage(query.has("error") ? "linkExpired" : "invalidLink")
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handlePasswordBlur = () => {
    if (!normalizeText(password)) {
      setPasswordError("");
      return;
    }
    setPasswordError(
      validatePassword(password, {
        emptyMessage: "newPasswordRequired"
      })
    )
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("");
      return;
    }
    setConfirmPasswordError(
      validateConfirmPassword(confirmPassword, password, {
        emptyMessage: "newPasswordConfirmRequired"
      })
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextPasswordError = validatePassword(password, {
      emptyMessage: "newPasswordRequired"
    })
    const nextConfirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password,
      { emptyMessage: "newPasswordConfirmRequired" }
    )

    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);

    if (nextPasswordError || nextConfirmPasswordError) {
      return;
    }

    if (!tokenHash) {
      setRequestMessage("invalidLink");
      return;
    }

    setIsSubmitting(true);
    setRequestMessage("");
    const result = await authClient.resetPassword({ token: tokenHash, newPassword: password });
    setIsSubmitting(false);
    if (result.error) {
      setRequestMessage(result.error.status === 400 || result.error.status === 401 || result.error.status === 403 ? "linkExpired" : "requestFailed");
      return;
    }
    router.push("/login");
  };

  return (
    <form
      className="mt-9 w-full"
      onSubmit={handleSubmit}
      noValidate
    >
      <label
        htmlFor="new-password"
        className="relative mb-6 block text-sm font-medium"
      >
        {t("newPasswordLabel")} <span className="text-gdg-red">*</span>
        <PasswordInput
          id="new-password"
          name="new-password"
          value={password}
          onChange={(event) => handlePasswordChange(event.target.value)}
          onBlur={handlePasswordBlur}
          placeholder={t("newPasswordPlaceholder")}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "new-password-error" : undefined}
          className="mt-1.5 h-8.5 rounded-md border border-foreground/15 px-2.75 text-base font-normal outline-none placeholder:text-foreground/40"
        />

        <AuthErrorMessage
          id="new-password-error"
          message={passwordError}
          className="absolute start-0 top-full mt-1"
        />
      </label>

      {requestMessage ? (
        <div role="alert" className="mt-3 text-sm text-gdg-red">
          <p>{t(requestMessage)}</p>
          {!tokenHash ? (
            <Link href="/forgot-password" className="mt-1 inline-block font-medium text-blue hover:underline">
              {t("requestNewLink")}
            </Link>
          ) : null}
        </div>
      ) : null}

      <label
        htmlFor="confirm-password"
        className="relative mt-3 block text-sm font-medium"
      >
        {t("confirmPasswordLabel")} <span className="text-gdg-red">*</span>
        <PasswordInput
          id="confirm-password"
          name="confirm-password"
          value={confirmPassword}
          onChange={(event) =>
            handleConfirmPasswordChange(event.target.value)
          }
          onBlur={handleConfirmPasswordBlur}
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          aria-invalid={Boolean(confirmPasswordError)}
          aria-describedby={
            confirmPasswordError ? "confirm-password-error" : undefined
          }
          className="mt-1.5 h-8.5 rounded-md border border-foreground/15 px-2.75 text-base font-normal outline-none placeholder:text-foreground/40"
        />

        <AuthErrorMessage
          id="confirm-password-error"
          message={confirmPasswordError}
          className="absolute start-0 top-full mt-1"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting || (!tokenHash)}
        className="mt-9.5 h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80 disabled:cursor-not-allowed disabled:bg-blue/70"
      >
        {isSubmitting ? t("submitting") : (submitLabel ?? t("submit"))}
      </button>
    </form>
  );
}
