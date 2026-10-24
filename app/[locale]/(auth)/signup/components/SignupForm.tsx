"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import AuthStepTransition from "@/app/components/auth/AuthStepTransition"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import PasswordInput from "@/app/components/auth/PasswordInput"
import { validateEmail } from "@/app/lib/validation/email"
import { validateConfirmPassword, validatePassword } from "@/app/lib/validation/password"
import {
  branchOptions,
  collegeOptions,
  committeeOptions,
  genderOptions,
  levelOptions,
  majorOptions,
  roleOptions,
  universityOptions,
} from "@/data/signup"
import { useTranslations } from "next-intl"
import SignupProgress from "./SignupProgress"
import { useRouter } from "@/i18n/navigation"
import { API_ENABLED, apiRequest } from "@/lib/api/client"
import { storeAuthSession } from "@/lib/auth/session"
import { submitMembershipRequest, type MembershipApplicationPayload } from "@/lib/membership-requests/api"

const membershipCommitteeCodes: Record<string, string> = {
  "Project Management Committee": "PM",
  "Public Relations Committee": "PR",
  "Digital Media and Design Committee": "MEDIA",
  "Content Writing Committee": "CONTENT",
  "Artificial Intelligence Committee": "AI",
  "Data Analytics Committee": "DATA",
  "Cybersecurity Committee": "CYBER",
  "Robotics Committee": "ROBOTICS",
  "Automation Committee": "AUTOMATION",
  "Web design and development": "WEB",
}

function membershipCommitteeCode(name: string) {
  return membershipCommitteeCodes[name] ?? name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 20)
}

type FieldName =
  | "fullName" | "phone" | "personalEmail" | "universityEmail" | "password" | "confirmPassword" | "gender"
  | "university" | "branch" | "college" | "major" | "level" | "committees"

type FormValues = Record<Exclude<FieldName, "committees">, string> & {
  committees: string[]
  committeeRoles: Record<string, string>
}
type FieldErrors = Partial<Record<FieldName, string>> & Record<string, string | undefined>

function committeeRoleErrorKey(committee: string) {
  return `committeeRole:${committee}`
}

const initialValues: FormValues = {
  fullName: "",
  personalEmail: "",
  universityEmail: "",
  phone: "",
  gender: "",
  password: "",
  confirmPassword: "",
  university: "",
  branch: "",
  college: "",
  major: "",
  level: "",
  committees: [],
  committeeRoles: {},
}

const selectOptions: Partial<Record<FieldName, readonly string[]>> = {
  gender: genderOptions.map(({ value }) => value),
  university: universityOptions,
  branch: branchOptions,
  college: collegeOptions,
  major: majorOptions,
  level: levelOptions,
}

function validateName(value: string) {
  const name = value.trim()
  if (!name) return "fullNameRequired"
  if (name.length > 255) return "fullNameTooLong"
  return /^[\p{L}\p{M}\s.'-]+$/u.test(name) ? "" : "nameInvalid"
}

function validatePhone(value: string) {
  const phone = value.trim()
  if (!phone) return "phoneRequired"
  if (!/^5\d{8}$/.test(phone)) return "phoneFormat"
  return ""
}

function validateChoice(field: FieldName, value: string) {
  if (!value) return field === "university" ? "universityChoiceRequired" : `${field}Required`
  return selectOptions[field]?.includes(value) ? "" : "fieldInvalid"
}

function validateField(field: FieldName, values: FormValues, membership: "member" | "nonMember" | "") {
  const value = field === "committees" ? "" : values[field] as string
  switch (field) {
    case "fullName": return validateName(value)
    case "personalEmail": return validateEmail(value)
    case "universityEmail":
      if (membership === "nonMember" && !value.trim()) return ""
      return validateEmail(value)
    case "password": return validatePassword(value)
    case "confirmPassword": return validateConfirmPassword(value, values.password)
    case "phone": return validatePhone(value)
    case "committees":
      if (!values.committees.length) return "committeeRequired"
      return values.committees.every((item) => committeeOptions.includes(item as typeof committeeOptions[number]))
        ? ""
        : "fieldInvalid"
    default: return validateChoice(field, value)
  }
}

function TextField({
  id, label, value, onChange, onBlur, error, type = "text", placeholder,
  maxLength = 255, inputMode, autoComplete, required = true,
  className = "",
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  type?: string
  placeholder?: string
  maxLength?: number
  inputMode?: "text" | "email" | "tel"
  autoComplete?: string
  required?: boolean
  className?: string
}) {
  const errorId = `${id}-error`
  return (
    <label htmlFor={id} className={`relative block text-sm font-medium ${className}`}>
      {label} {required && <span className="text-gdg-red" aria-hidden="true">*</span>}
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 h-8 w-full rounded-md border px-2.75 text-sm font-normal outline-none placeholder:text-foreground/40 ${error ? "border-gdg-red" : "border-foreground/15"}`}
      />
      <AuthErrorMessage id={errorId} message={error ?? ""} className="absolute start-0 top-full mt-0.5" />
    </label>
  )
}

function PasswordField({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
  onBlur,
}: {
  id: "password" | "confirmPassword"
  label: string
  value: string
  placeholder: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const errorId = `${id}-error`
  return (
    <label htmlFor={id} className="relative block text-sm font-medium">
      {label} <span className="text-gdg-red" aria-hidden="true">*</span>
      <PasswordInput
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 h-8 w-full rounded-md border px-2.75 pe-9 text-sm font-normal outline-none placeholder:text-foreground/40 ${error ? "border-gdg-red" : "border-foreground/15"}`}
      />
      <AuthErrorMessage id={errorId} message={error ?? ""} className="absolute start-0 top-full mt-0.5" />
    </label>
  )
}

function ChoiceField({
  id, label, placeholder, options, value, error, onChange, onBlur,
}: {
  id: string
  label: string
  placeholder: string
  options: readonly (string | { value: string; label: string })[]
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const errorId = `${id}-error`
  return (
    <div className="relative block text-sm font-medium">
      <label htmlFor={id}>{label} <span className="text-gdg-red" aria-hidden="true">*</span></label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 h-8 w-full rounded-md border bg-surface px-2.75 text-sm font-normal outline-none ${error ? "border-gdg-red" : "border-foreground/15"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((item) => {
          const option = typeof item === "string" ? { value: item, label: item } : item
          return <option key={option.value} value={option.value}>{option.label}</option>
        })}
      </select>
      <AuthErrorMessage id={errorId} message={error ?? ""} className="absolute start-0 top-full mt-0.5" />
    </div>
  )
}

export default function SignupForm() {
  const t = useTranslations("auth.signup")
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [membership, setMembership] = useState<"member" | "nonMember" | "">("")
  const [membershipError, setMembershipError] = useState("")
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const update = (field: FieldName, value: string | string[]) => {
    const next = { ...values, [field]: value } as FormValues
    const hideBranch = field === "university" && value !== "University of Jeddah"
    if (hideBranch) next.branch = ""
    setValues(next)
    if (errors[field]) {
      const error = validateField(field, next, membership)
      setErrors((current) => ({ ...current, [field]: error || undefined }))
    }
    if (hideBranch) {
      setErrors((current) => ({ ...current, branch: undefined }))
    }
    if (field === "password" && next.confirmPassword) {
      const confirmError = validateConfirmPassword(next.confirmPassword, next.password)
      setErrors((current) => ({ ...current, confirmPassword: confirmError || undefined }))
    }
  }

  const blur = (field: FieldName) => {
    const error = validateField(field, values, membership)
    setErrors((current) => ({ ...current, [field]: error || undefined }))
  }

  const fields: FieldName[] = step === 1
    ? membership === "member"
      ? ["fullName", "phone", "personalEmail", "universityEmail", "password", "confirmPassword", "gender"]
      : ["fullName", "personalEmail", "universityEmail", "phone", "gender", "password", "confirmPassword"]
    : membership === "member"
      ? [
        "university",
        ...(values.university === "University of Jeddah" ? ["branch" as const] : []),
        "college",
        "major",
        "level",
        "committees",
      ]
      : ["university", "college", "major", "level"]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    if (step === 0) {
      if (!membership) {
        setMembershipError("membershipRequired")
        return
      }
      setMembershipError("")
      setStep(1)
      return
    }
    const nextErrors: FieldErrors = {}
    fields.forEach((field) => {
      const error = validateField(field, values, membership)
      if (error) nextErrors[field] = error
    })
    if (step === 2 && membership === "member") {
      values.committees.forEach((committee) => {
        const role = values.committeeRoles[committee]
        if (!role) {
          nextErrors[committeeRoleErrorKey(committee)] = "committeeRoleRequired"
        } else if (!roleOptions.includes(role as typeof roleOptions[number])) {
          nextErrors[committeeRoleErrorKey(committee)] = "fieldInvalid"
        }
      })
    }
    setErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length) return

    setErrors({})
    if (step === 1) {
      setStep(2)
      return
    }

    setSubmitError("")
    setIsSubmitting(true)
    if (!API_ENABLED) {
      setSubmitError("apiRequired")
      setIsSubmitting(false)
      return
    }

    const membershipApplication: MembershipApplicationPayload | null = membership === "member"
      ? {
          applicationData: {
            phoneNumber: `+966${values.phone}`,
            universityEmail: values.universityEmail,
            university: values.university,
            ...(values.branch ? { branch: values.branch } : {}),
            college: values.college,
            major: values.major,
            level: values.level,
            gender: values.gender,
          },
          committees: values.committees.map((committee) => ({
            committeeCode: membershipCommitteeCode(committee),
            requestedRole: values.committeeRoles[committee],
          })),
        }
      : null

    const result = await apiRequest<{
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      emailVerificationRequired?: boolean;
    }>("/auth/signup", {
      method: "POST",
      body: {
        fullName: values.fullName,
        email: values.personalEmail,
        password: values.password,
      },
    })
    if (!result.ok) {
      if (result.code === "EMAIL_ALREADY_EXISTS") {
        setSubmitError("emailAlreadyExists")
      } else if (result.code === "EMAIL_ADDRESS_NOT_AUTHORIZED") {
        setSubmitError("signupEmailNotAuthorized")
      } else if (result.status === 429) {
        setSubmitError("emailRateLimited")
      } else if (result.status === 0 || result.status >= 500) {
        setSubmitError("signupServiceUnavailable")
      } else {
        setSubmitError("authRequestFailed")
      }
      setIsSubmitting(false)
      return
    }

    const pending = {
      email: values.personalEmail,
      membershipApplication,
    }
    window.sessionStorage.setItem("gdg.pending-signup", JSON.stringify(pending))

    if (result.data.accessToken && result.data.refreshToken) {
      storeAuthSession({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresAt: result.data.expiresAt,
      })
      if (membershipApplication) {
        const requestResult = await submitMembershipRequest(membershipApplication)
        if (!requestResult.ok) {
          router.push("/signup/verify")
          return
        }
      }
      window.sessionStorage.removeItem("gdg.pending-signup")
      router.replace("/dashboard")
      return
    }

    router.push("/signup/verify")
    setIsSubmitting(false)
  }

  const handleBack = () => {
    setErrors({})
    if (step === 2) setStep(1)
    else setStep(0)
  }

  const chooseMembership = (value: "member" | "nonMember") => {
    setMembership(value)
    setMembershipError("")
    setErrors({})
    if (value === "nonMember") {
      setValues((current) => ({
        ...current,
        universityEmail: "",
        confirmPassword: "",
        branch: "",
        committees: [],
        committeeRoles: {},
      }))
    }
  }

  const updateCommitteeRole = (committee: string, role: string) => {
    const errorKey = committeeRoleErrorKey(committee)
    setValues((current) => ({
      ...current,
      committeeRoles: { ...current.committeeRoles, [committee]: role },
    }))
    setErrors((current) => ({
      ...current,
      [errorKey]: role ? undefined : current[errorKey] ? "committeeRoleRequired" : undefined,
    }))
  }

  const toggleCommittee = (committee: string, checked: boolean) => {
    setValues((current) => {
      const committees = checked
        ? [...current.committees, committee]
        : current.committees.filter((item) => item !== committee)
      const committeeRoles = { ...current.committeeRoles }
      if (!checked) delete committeeRoles[committee]
      return { ...current, committees, committeeRoles }
    })

    setErrors((current) => {
      const next = { ...current }
      delete next[committeeRoleErrorKey(committee)]
      if (checked && next.committees === "committeeRequired") delete next.committees
      return next
    })
  }

  const field = (id: FieldName, label: string, placeholder: string, options: readonly (string | { value: string; label: string })[]) => (
    <ChoiceField
      id={id}
      label={label}
      placeholder={placeholder}
      options={options}
      value={values[id] as string}
      error={errors[id]}
      onChange={(value) => update(id, value)}
      onBlur={() => blur(id)}
    />
  )

  const personalEmail = t("fields.personalEmail.label")
  const universityEmail = t("fields.universityEmail.label")
  const renderMemberPersonal: ReactNode = (
    <>
      <TextField id="fullName" label={t("fields.fullName.label")} value={values.fullName} onChange={(value) => update("fullName", value)} onBlur={() => blur("fullName")} error={errors.fullName} placeholder={t("fields.fullName.placeholder")} autoComplete="name" />
      <TextField id="phone" label={t("fields.phone.label")} type="tel" inputMode="tel" value={values.phone} onChange={(value) => update("phone", value)} onBlur={() => blur("phone")} error={errors.phone} placeholder={t("fields.phone.placeholder")} maxLength={9} autoComplete="tel-national" />
      <TextField id="personalEmail" label={personalEmail} type="email" inputMode="email" value={values.personalEmail} onChange={(value) => update("personalEmail", value)} onBlur={() => blur("personalEmail")} error={errors.personalEmail} placeholder={t("fields.personalEmail.placeholder")} maxLength={254} autoComplete="email" />
      <TextField id="universityEmail" label={universityEmail} type="email" inputMode="email" value={values.universityEmail} onChange={(value) => update("universityEmail", value)} onBlur={() => blur("universityEmail")} error={errors.universityEmail} placeholder={t("fields.universityEmail.placeholder")} maxLength={254} autoComplete="email" />
      <PasswordField id="password" label={t("fields.password.label")} value={values.password} onChange={(value) => update("password", value)} onBlur={() => blur("password")} error={errors.password} placeholder={t("fields.password.placeholder")} />
      <PasswordField id="confirmPassword" label={t("fields.confirmPassword.label")} value={values.confirmPassword} onChange={(value) => update("confirmPassword", value)} onBlur={() => blur("confirmPassword")} error={errors.confirmPassword} placeholder={t("fields.confirmPassword.placeholder")} />
      {field("gender", t("fields.gender.label"), t("fields.gender.placeholder"), genderOptions.map(({ value, labelKey }) => ({
        value,
        label: t(`options.gender.${labelKey}`),
      })))}
    </>
  )

  const renderNonMemberPersonal: ReactNode = (
    <>
      <TextField id="fullName" label={t("fields.fullName.label")} value={values.fullName} onChange={(value) => update("fullName", value)} onBlur={() => blur("fullName")} error={errors.fullName} placeholder={t("fields.fullName.placeholder")} autoComplete="name" />
      <TextField id="phone" label={t("fields.phone.label")} type="tel" inputMode="tel" value={values.phone} onChange={(value) => update("phone", value)} onBlur={() => blur("phone")} error={errors.phone} placeholder={t("fields.phone.placeholder")} maxLength={9} autoComplete="tel-national" />
      <TextField id="personalEmail" label={personalEmail} type="email" inputMode="email" value={values.personalEmail} onChange={(value) => update("personalEmail", value)} onBlur={() => blur("personalEmail")} error={errors.personalEmail} placeholder={t("fields.personalEmail.placeholder")} maxLength={254} autoComplete="email" />
      <TextField id="universityEmail" label={`${universityEmail} (${t("optional")})`} type="email" inputMode="email" value={values.universityEmail} onChange={(value) => update("universityEmail", value)} onBlur={() => blur("universityEmail")} error={errors.universityEmail} placeholder={t("fields.universityEmail.placeholder")} maxLength={254} autoComplete="email" required={false} />
      <PasswordField id="password" label={t("fields.password.label")} value={values.password} onChange={(value) => update("password", value)} onBlur={() => blur("password")} error={errors.password} placeholder={t("fields.password.placeholder")} />
      <PasswordField id="confirmPassword" label={t("fields.confirmPassword.label")} value={values.confirmPassword} onChange={(value) => update("confirmPassword", value)} onBlur={() => blur("confirmPassword")} error={errors.confirmPassword} placeholder={t("fields.confirmPassword.placeholder")} />
      {field("gender", t("fields.gender.label"), t("fields.gender.placeholder"), genderOptions.map(({ value, labelKey }) => ({
        value,
        label: t(`options.gender.${labelKey}`),
      })))}
    </>
  )

  return (
    <>
      {(step === 1 || step === 2) && <SignupProgress step={step} />}
      {step === 0 && (
        <h1 className="text-center text-3xl font-bold leading-tight md:text-4xl">
          {t("title")}
        </h1>
      )}
      <form onSubmit={handleSubmit} noValidate className={`${step === 0 ? "mt-8" : "mt-6"} flex w-full flex-col`}>
        <AuthErrorMessage message={submitError} className="mb-3" />
        <AuthStepTransition stepKey={step} className="grid w-full grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          {step === 0 ? (
            <fieldset data-membership-choice className="col-span-full" aria-describedby={membershipError ? "membership-error" : undefined}>
              <legend className="mb-8 text-sm font-medium">{t("membershipQuestion")}</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(["member", "nonMember"] as const).map((option) => (
                  <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm ${membership === option ? "border-blue bg-blue/5" : "border-foreground/15"}`}>
                    <input type="radio" name="membership" value={option} checked={membership === option} onChange={() => chooseMembership(option)} />
                    {t(option === "member" ? "memberChoice" : "nonMemberChoice")}
                  </label>
                ))}
              </div>
              <AuthErrorMessage id="membership-error" message={membershipError} className="mt-1" />
              <div className="mt-10">
                <button type="submit" className="h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] hover:bg-blue/90">{t("continue")}</button>
              </div>
            </fieldset>
          ) : step === 1 ? (
            <>
              {membership === "member" ? renderMemberPersonal : renderNonMemberPersonal}
              <div className="col-span-full mt-2 flex w-full flex-col gap-3 lg:flex-row">
                <button type="button" onClick={handleBack} className="h-8.75 w-full rounded-[5px] border border-blue text-sm font-medium text-blue hover:bg-blue/10">{t("back")}</button>
                <button type="submit" className="h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] hover:bg-blue/90">{t("continue")}</button>
              </div>
            </>
          ) : (
            <>
              {field("university", t("fields.university.label"), t("fields.university.placeholder"), universityOptions)}
              {membership === "member" && values.university === "University of Jeddah" &&
                field("branch", t("fields.branch.label"), t("fields.branch.placeholder"), branchOptions)}
              {field("college", t("fields.college.label"), t("fields.college.placeholder"), collegeOptions)}
              {field("major", t("fields.major.label"), t("fields.major.placeholder"), majorOptions)}
              {field("level", t("fields.level.label"), t("fields.level.placeholder"), levelOptions)}
              {membership === "member" && <fieldset
                className="relative col-span-full"
                aria-required="true"
                aria-invalid={Boolean(errors.committees)}
                aria-describedby={errors.committees ? "committees-error" : undefined}
              >
                <legend className="mb-2 text-sm font-medium">{t("fields.committees.label")} <span className="text-gdg-red" aria-hidden="true">*</span></legend>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  {committeeOptions.map((committee) => (
                    <label key={committee} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="committees"
                        value={committee}
                        checked={values.committees.includes(committee)}
                        onChange={(event) => toggleCommittee(committee, event.target.checked)}
                      />
                      {committee}
                    </label>
                  ))}
                </div>
                <AuthErrorMessage id="committees-error" message={errors.committees ?? ""} className="mt-1" />
                {values.committees.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
                    <p className="col-span-full text-sm text-foreground/65">
                      {t("fields.committeeRolesInstruction")}
                    </p>
                    {values.committees.map((committee, index) => {
                      const errorKey = committeeRoleErrorKey(committee)
                      const error = errors[errorKey]
                      return (
                        <ChoiceField
                          key={committee}
                          id={`committee-role-${index}`}
                          label={`${t("fields.role.label")}: ${committee.replace(/ Committee$/, "")}`}
                          placeholder={t("fields.role.placeholder")}
                          options={roleOptions}
                          value={values.committeeRoles[committee] ?? ""}
                          error={error}
                          onChange={(role) => updateCommitteeRole(committee, role)}
                          onBlur={() => {
                            const role = values.committeeRoles[committee]
                            setErrors((current) => ({
                              ...current,
                              [errorKey]: role ? undefined : "committeeRoleRequired",
                            }))
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </fieldset>}
              <div className="col-span-full mt-2 flex w-full flex-col gap-3 lg:flex-row">
                <button type="button" onClick={handleBack} className="h-8.75 w-full rounded-[5px] border border-blue text-sm font-medium text-blue hover:bg-blue/10">{t("back")}</button>
                <button type="submit" disabled={isSubmitting} className="h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] disabled:cursor-not-allowed disabled:bg-blue/70">
                  {isSubmitting ? t("creatingAccount") : t("createAccount")}
                </button>
              </div>
            </>
          )}
        </AuthStepTransition>
      </form>
    </>
  )
}
