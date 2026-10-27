"use client"

import { type ClipboardEvent, type FormEvent, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import AuthErrorMessage from "./AuthErrorMessage"
import { API_ENABLED, apiRequest } from "@/lib/api/client"
import { storeAuthSession, type AuthSession } from "@/lib/auth/session"
import { useRouter } from "@/i18n/navigation"

const CODE_LENGTH = 6

function validateCode(code: string[]) {
  const joined = code.join("")

  if (!joined) {
    return "codeRequired"
  }

  if (!/^\d{6}$/.test(joined)) {
    return "codeIncomplete"
  }

  return ""
}

export default function VerifyCodeForm() {
  const t = useTranslations("auth.verifyCode")
  const router = useRouter()
  const [code, setCode] = useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, () => "")
  )
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function updateCode(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const nextCode = [...code]
    nextCode[index] = digit
    setCode(nextCode)

    if (error) {
      setError("")
    }

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH)

    if (!pastedCode) return

    const nextCode = Array.from(
      { length: CODE_LENGTH },
      (_, index) => pastedCode[index] ?? ""
    )
    setCode(nextCode)

    if (error) {
      setError("")
    }

    inputRefs.current[Math.min(pastedCode.length, CODE_LENGTH) - 1]?.focus()
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleResend() {
    if (isResending || !API_ENABLED) return
    let pending: { email?: string } = {}
    try {
      pending = JSON.parse(window.sessionStorage.getItem("gdg.pending-signup") ?? "{}")
    } catch { pending = {} }
    if (!pending.email) {
      setError("authRequestFailed")
      return
    }
    setIsResending(true)
    setResendMessage("")
    const result = await apiRequest<{ sent: true }>("/auth/resend-personal-verification", { method: "POST", body: { email: pending.email } })
    if (result.ok) setResendMessage(t("resent"))
    else setError("authRequestFailed")
    setIsResending(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const message = validateCode(code)
    if (message) {
      setError(message)
      return
    }

    setError("")
    setIsSubmitting(true)
    if (!API_ENABLED) {
      setError("apiRequired")
      setIsSubmitting(false)
      return
    }

    let pending: { email?: string } = {}
    try {
      pending = JSON.parse(window.sessionStorage.getItem("gdg.pending-signup") ?? "{}")
    } catch {
      pending = {}
    }
    if (!pending.email) {
      setError("authRequestFailed")
      setIsSubmitting(false)
      return
    }

    const verified = await apiRequest<AuthSession & { authenticated?: true; registrationPendingApproval?: boolean } | { authenticated: false; registrationPendingApproval: boolean }>("/auth/verify-email", {
        method: "POST",
        body: { email: pending.email, token: code.join("") },
      })
    if (!verified.ok) {
      setError("authRequestFailed")
      setIsSubmitting(false)
      return
    }
    if (verified.data.authenticated === false) {
      window.sessionStorage.removeItem("gdg.pending-signup")
      router.replace(verified.data.registrationPendingApproval ? "/signup/pending" : "/login")
      setIsSubmitting(false)
      return
    }
    storeAuthSession(verified.data)
    if (verified.data.registrationPendingApproval === false) {
      window.sessionStorage.removeItem("gdg.pending-signup")
      router.replace("/")
      return
    }
    window.sessionStorage.removeItem("gdg.pending-signup")
    router.replace("/signup/pending")
  }

  return (
    <form
      className="mt-19 w-full"
      onSubmit={handleSubmit}
      noValidate
    >
      <input
        type="hidden"
        name="email"
        readOnly
      />

      <div className="relative">
        <div
          className="flex w-full justify-between gap-2.5"
          // Digits always read left to right, even on Arabic pages.
          dir="ltr"
          role="group"
          aria-label={t("groupLabel")}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              aria-label={t("digitLabel", { number: index + 1 })}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "verify-code-error" : undefined}
              inputMode="numeric"
              maxLength={1}
              name={`code-${index + 1}`}
              pattern="[0-9]"
              type="text"
              value={digit}
              onChange={(event) => updateCode(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event.key)}
              onPaste={handlePaste}
              className="h-12.5 min-w-0 flex-1 rounded-md border border-foreground/15 text-center text-lg outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue/25"
            />
          ))}
        </div>

        <AuthErrorMessage
          id="verify-code-error"
          message={error}
          className="absolute inset-x-0 top-full mt-1.5 text-center"
        />
      </div>

      <p className="mt-3 text-center text-sm text-foreground/60">{t("personalEmailCode")}</p>
      {resendMessage ? <p role="status" className="mt-2 text-center text-sm text-green-700">{resendMessage}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-10.25 h-8.75 w-full rounded-[5px] bg-gdg-blue text-sm font-medium text-[var(--white)] transition-colors duration-200 hover:bg-gdg-blue/90 active:bg-gdg-blue/80 disabled:cursor-not-allowed disabled:bg-gdg-blue/70"
      >
        {isSubmitting ? t("verifying") : t("verify")}
      </button>

      <p className="mt-7.5 text-center text-sm text-foreground/45">
        {t("noCode")}{" "}
        <button
          type="button"
          disabled={isResending}
          onClick={handleResend}
          className="cursor-pointer text-sm font-medium text-gdg-blue hover:text-gdg-blue/90 active:text-gdg-blue/80"
        >
          {isResending ? t("verifying") : t("resend")}
        </button>
      </p>
    </form>
  )
}
