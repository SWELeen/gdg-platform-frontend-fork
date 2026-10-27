"use client";

import { useLocale, useTranslations } from "next-intl"
import { type FormEvent, useState } from "react"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import { EMAIL_MAX_LENGTH, validateEmail } from "@/app/lib/validation/email"
import { apiRequest } from "@/lib/api/client"

function normalizeText(value: string) {
  return value.trim();
}

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword")
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")
  const [requestSucceeded, setRequestSucceeded] = useState(false)

  const handleChange = (value: string) => {
    setEmail(value.trimStart());
    if (emailError) {
      setEmailError("");
    }
  };

  const handleBlur = () => {
    if (!normalizeText(email)) {
      setEmailError("");
      return;
    }
    setEmailError(validateEmail(email));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);

    if (nextEmailError) {
      return;
    }

    setEmail(normalizeText(email));
    setIsSubmitting(true);
    setRequestMessage("");
    setRequestSucceeded(false);
    const result = await apiRequest<null>("/auth/setup-password/request", {
      method: "POST",
      body: { email: normalizeText(email), locale },
    });
    setIsSubmitting(false);
    setRequestSucceeded(result.ok);
    setRequestMessage(result.ok ? t("requestSent") : t("requestFailed"));
  };

  return (
    <form
      className="mt-8 w-full"
      onSubmit={handleSubmit}
      noValidate
    >
      <label
        htmlFor="email"
        className="relative block text-sm font-medium"
      >
        {t("emailLabel")} <span className="text-gdg-red">*</span>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          maxLength={EMAIL_MAX_LENGTH}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-error" : undefined}
          className="mt-1.5 h-9 w-full rounded-md border border-foreground/15 px-2.75 text-base outline-none placeholder:text-foreground/40"
        />

        <AuthErrorMessage
          id="email-error"
          message={emailError}
          className="absolute start-0 top-full mt-1"
        />
      </label>

      {requestMessage ? (
        <p role="status" className={`mt-3 text-sm ${requestSucceeded ? "text-green-500" : "text-gdg-red"}`}>
          {requestMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-blue/90 active:bg-blue/80 disabled:cursor-not-allowed disabled:bg-blue/70"
      >
        {isSubmitting ? t("sending") : t("sendCode")}
      </button>
    </form>
  );
}
