"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import { API_ENABLED, apiRequest } from "@/lib/api/client"
import { storeAuthSession, type AuthSession } from "@/lib/auth/session"
import { canReturnTo, dashboardPathFor, type AuthenticatedIdentity } from "@/lib/auth/dashboard-route"
import { useRouter } from "@/i18n/navigation"
import AuthCard from "@/app/components/auth/AuthCard"
import AuthStepTransition from "@/app/components/auth/AuthStepTransition"
import { validateEmail } from "@/app/lib/validation/email"
import { validatePassword } from "@/app/lib/validation/password"
import LoginEmail from "./LoginEmail"
import LoginPassword from "./LoginPassword"

function normalizeText(value: string) {
  return value.trim()
}

function dashboardReturnPath(): string | null {
  const requested = new URLSearchParams(window.location.search).get("returnTo")
  return requested?.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\")
    ? requested
    : null
}

export default function LoginFlow() {
  const t = useTranslations("auth.login")
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const isEmailStep = step === 1

  const handleEmailChange = (value: string) => {
    const nextValue = value.trimStart()
    setEmail(nextValue)
    if (emailError) {
      setEmailError("")
    }
  }

  const handleEmailBlur = () => {
    if (!normalizeText(email)) {
      setEmailError("")
      return
    }
    setEmailError(validateEmail(email))
  }

  const handleEmailSubmit = () => {
    const nextEmailError = validateEmail(email)
    setEmailError(nextEmailError)

    if (nextEmailError) {
      return
    }

    setEmail(normalizeText(email))
    setStep(2)
  }

  const handlePasswordChange = (value: string) => {
    const nextValue = value.trimStart()
    setPassword(nextValue)
    if (passwordError) {
      setPasswordError("")
    }
  }

  const handlePasswordBlur = () => {
    if (!normalizeText(password)) {
      setPasswordError("")
      return
    }
    setPasswordError(validatePassword(password))
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextPasswordError = validatePassword(password)
    setPasswordError(nextPasswordError)

    if (nextPasswordError) {
      return
    }

    const nextPassword = normalizeText(password)
    setPassword(nextPassword)
    setSubmitError("")
    setIsSubmitting(true)
    if (!API_ENABLED) {
      setSubmitError("apiRequired")
      setIsSubmitting(false)
      return
    }
    const result = await apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: { email: normalizeText(email), password: nextPassword },
    })
    if (!result.ok) {
      if (result.code === "EMAIL_NOT_VERIFIED") {
        window.sessionStorage.setItem("gdg.pending-signup", JSON.stringify({ email: normalizeText(email) }))
        router.push("/signup/verify")
        setIsSubmitting(false)
        return
      }
      if (result.status === 401) {
        setPasswordError("invalidCredentials")
      } else {
        setSubmitError("authRequestFailed")
      }
      setIsSubmitting(false)
      return
    }
    storeAuthSession(result.data)
    const identity = await apiRequest<AuthenticatedIdentity>("/me")
    if (!identity.ok) {
      setSubmitError("authRequestFailed")
      setIsSubmitting(false)
      return
    }
    const returnPath = dashboardReturnPath()
    router.replace(returnPath && canReturnTo(returnPath, identity.data) ? returnPath : dashboardPathFor(identity.data))
  }

  const handleBack = () => {
    setPasswordError("")
    setStep(1)
  }

  return (
    <AuthCard
      size="md"
      compact
      className="md:-translate-y-7"
      title={isEmailStep ? t("emailStep.title") : t("passwordStep.title")}
      description={
        isEmailStep
          ? t("emailStep.description")
          : t("passwordStep.description")
      }
    >
      <AuthErrorMessage message={submitError} className="mb-3 w-full" />
      <AuthStepTransition
        stepKey={step}
        className="flex w-full flex-col items-center"
      >
        {isEmailStep ? (
          <LoginEmail
            value={email}
            error={emailError}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            onContinue={handleEmailSubmit}
          />
        ) : (
          <LoginPassword
            value={password}
            error={passwordError}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            onBack={handleBack}
            onSubmit={handlePasswordSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </AuthStepTransition>
    </AuthCard>
  )
}
