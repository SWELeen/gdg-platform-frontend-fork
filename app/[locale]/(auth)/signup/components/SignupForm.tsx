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

function validateField(field: FieldName, values: FormValues) {
  const value = field === "committees" ? "" : values[field] as string
  switch (field) {
    case "fullName": return validateName(value)
    case "personalEmail":
    case "universityEmail": return validateEmail(value)
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
  maxLength = 255, inputMode, autoComplete,
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
  className?: string
}) {
  const errorId = `${id}-error`
  return (
    <label htmlFor={id} className={`relative block text-sm font-medium ${className}`}>
      {label} <span className="text-gdg-red" aria-hidden="true">*</span>
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
        required
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
  const [step, setStep] = useState<1 | 2>(1)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field: FieldName, value: string | string[]) => {
    const next = { ...values, [field]: value } as FormValues
    setValues(next)
    if (errors[field]) {
      const error = validateField(field, next)
      setErrors((current) => ({ ...current, [field]: error || undefined }))
    }
    if (field === "password" && next.confirmPassword) {
      const confirmError = validateConfirmPassword(next.confirmPassword, next.password)
      setErrors((current) => ({ ...current, confirmPassword: confirmError || undefined }))
    }
  }

  const blur = (field: FieldName) => {
    const error = validateField(field, values)
    setErrors((current) => ({ ...current, [field]: error || undefined }))
  }

  const fields: FieldName[] = step === 1
    ? ["fullName", "phone", "personalEmail", "universityEmail", "password", "confirmPassword", "gender"]
    : ["university", "branch", "college", "major", "level", "committees"]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    const nextErrors: FieldErrors = {}
    fields.forEach((field) => {
      const error = validateField(field, values)
      if (error) nextErrors[field] = error
    })
    if (step === 2) {
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

    // No registration endpoint is published in this frontend's API contract yet.
    setIsSubmitting(true)
    window.setTimeout(() => setIsSubmitting(false), 800)
  }

  const handleBack = () => {
    setErrors({})
    setStep(1)
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
  const renderPersonal: ReactNode = (
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

  return (
    <>
      <SignupProgress step={step} />
      <form onSubmit={handleSubmit} noValidate className="mt-6 flex w-full flex-col">
        <AuthStepTransition stepKey={step} className="grid w-full grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2">
          {step === 1 ? (
            <>
              {renderPersonal}
              <div className="col-span-full flex justify-end">
                <button type="submit" className="h-8.75 w-full rounded-[5px] bg-blue text-sm font-medium text-[var(--white)] hover:bg-blue/90">{t("continue")}</button>
              </div>
            </>
          ) : (
            <>
              {field("university", t("fields.university.label"), t("fields.university.placeholder"), universityOptions)}
              {field("branch", t("fields.branch.label"), t("fields.branch.placeholder"), branchOptions)}
              {field("college", t("fields.college.label"), t("fields.college.placeholder"), collegeOptions)}
              {field("major", t("fields.major.label"), t("fields.major.placeholder"), majorOptions)}
              {field("level", t("fields.level.label"), t("fields.level.placeholder"), levelOptions)}
              <fieldset
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
              </fieldset>
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
