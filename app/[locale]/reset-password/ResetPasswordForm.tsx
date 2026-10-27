"use client";

import { useTranslations } from "next-intl"
import { type FormEvent, useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { apiRequest } from "@/lib/api/client"
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
  const [accessToken, setAccessToken] = useState("")
  const [tokenHash, setTokenHash] = useState("")
  const [linkType, setLinkType] = useState<"recovery" | "invite" | "">("")
  const [requestMessage, setRequestMessage] = useState("")

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    const hash = query.get("token_hash") ?? fragment.get("token_hash")
    const bearerToken = fragment.get("access_token")
    const receivedType = query.get("type") ?? fragment.get("type")
    const errorCode = query.get("error_code") ?? fragment.get("error_code")
    const errorDescription = query.get("error_description") ?? fragment.get("error_description")
    const isValidType = receivedType === "recovery" || receivedType === "invite"
    const isValidHashLink = Boolean(hash && isValidType)
    const isLegacyAccessLink = Boolean(bearerToken && isValidType)
    const timer = window.setTimeout(() => {
      if (isValidHashLink) {
        setTokenHash(hash!)
        setLinkType(receivedType as "recovery" | "invite")
        // Delay removing credentials until this effect setup survives Strict Mode's
        // development cleanup; otherwise the second setup would see no token.
        window.history.replaceState(null, "", window.location.pathname)
      } else if (isLegacyAccessLink) {
        setAccessToken(bearerToken!)
        window.history.replaceState(null, "", window.location.pathname)
      } else if (errorCode === "otp_expired" || errorDescription?.toLowerCase().includes("expired")) {
        setRequestMessage("linkExpired")
      } else {
        setRequestMessage("invalidLink")
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

    if (!tokenHash && !accessToken) {
      setRequestMessage("invalidLink");
      return;
    }

    setIsSubmitting(true);
    setRequestMessage("");
    const result = tokenHash
      ? await apiRequest<{ passwordUpdated: true }>("/auth/setup-password/complete", {
          method: "POST",
          body: { tokenHash, type: linkType, password },
        })
      : await apiRequest<{ authenticated: true }>("/auth/setup-password", {
          method: "POST",
          body: { password },
          accessToken,
        });
    setIsSubmitting(false);
    if (!result.ok) {
      setRequestMessage(result.status === 401 || result.status === 403 ? "linkExpired" : "requestFailed");
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
          {!accessToken && !tokenHash ? (
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
        disabled={isSubmitting || (!accessToken && !tokenHash)}
        className="mt-9.5 h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80 disabled:cursor-not-allowed disabled:bg-blue/70"
      >
        {isSubmitting ? t("submitting") : (submitLabel ?? t("submit"))}
      </button>
    </form>
  );
}
