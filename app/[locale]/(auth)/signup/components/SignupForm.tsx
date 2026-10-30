"use client"

import { FaChevronDown } from "react-icons/fa6";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import AuthStepTransition from "@/app/components/auth/AuthStepTransition"
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage"
import PasswordInput from "@/app/components/auth/PasswordInput"
import { validateEmail } from "@/app/lib/validation/email"
import { PASSWORD_MAX_LENGTH, validateConfirmPassword, validatePassword } from "@/app/lib/validation/password"
import {
  branchOptions,
  collegeOptions,
  committeeCodes,
  committeeOptions,
  committeeSkillOptions,
  type CommitteeOption,
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


type FieldName =
  | "fullName" | "phone" | "personalEmail" | "universityEmail" | "password" | "confirmPassword" | "gender"
  | "university" | "branch" | "college" | "major" | "level" | "committees"

type FormValues = Record<Exclude<FieldName, "committees">, string> & {
  committees: string[]
  committeeRoles: Record<string, string>
  committeeSkills: Record<string, string[]>
  globalRoleSkills: Record<string, string[]>
  developerCommitteesLeader: boolean
  advisor: boolean
}
type FieldErrors = Partial<Record<FieldName, string>> & Record<string, string | undefined>

function committeeRoleErrorKey(committee: string) {
  return `committeeRole:${committee}`
}

function committeeSkillErrorKey(committee: string) {
  return `committeeSkill:${committee}`
}

const globalRoleSkillOptions = {
  DEVELOPER_COMMITTEES_LEADER: [
    "Workflow Automation",
    "No-Code Tools",
    "Process Mapping",
    "System Integration",
    "Optimization",
  ],
  ADVISOR: [
    "Leadership",
    "Mentorship",
    "Planning",
    "Strategy",
    "Community Support",
  ],
} as const

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
  committeeSkills: {},
  globalRoleSkills: {},
  developerCommitteesLeader: false,
  advisor: false,
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
    case "personalEmail": return validateEmail(value)
    case "universityEmail":
      if (!value.trim()) return ""
      if (value.trim().toLowerCase() === values.personalEmail.trim().toLowerCase()) return "signupEmailsMustDiffer"
      return validateEmail(value)
    case "password": return validatePassword(value)
    case "confirmPassword": return validateConfirmPassword(value, values.password)
    case "phone": return validatePhone(value)
    case "committees":
      if (!values.committees.length && !values.developerCommitteesLeader && !values.advisor) return "committeeRequired"
      return values.committees.every((item) => committeeOptions.includes(item as CommitteeOption))
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
        maxLength={PASSWORD_MAX_LENGTH}
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

function CommitteeSkillsPicker({
  label,
  options,
  value,
  error,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string[]
  error?: string
  onChange: (skills: string[]) => void
}) {
  const t = useTranslations("auth.signup")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const removeSkill = (skill: string) => {
    onChange(value.filter((item) => item !== skill))
  }

  const toggleSkill = (skill: string, checked: boolean) => {
    const next = checked ? [...value, skill] : value.filter((item) => item !== skill)
    onChange(next)
  }

  return (
    <div ref={containerRef} className="relative block text-sm font-medium">
      <label className="block">
        {label} <span className="text-gdg-red" aria-hidden="true">*</span>
      </label>

      <div className="relative mt-1.5">
        <div
          className={`flex min-h-8 w-full flex-col justify-center rounded-md border bg-surface px-2.75 py-1.5 transition ${error ? "border-gdg-red" : "border-foreground/15"}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex max-h-[80px] min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
              {value.length === 0 ? (
                <span className="text-sm text-foreground/40">{t("fields.skills.placeholder")}</span>
              ) : (
                value.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-foreground/15 bg-foreground/5 px-1.5 py-0.5 text-[11px] text-foreground"
                  >
                    <span className="truncate">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
                      aria-label={t("fields.skills.remove", { skill })}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-xs text-foreground/70 outline-none"
              aria-expanded={isOpen}
              aria-label={isOpen ? t("fields.skills.close") : t("fields.skills.open")}
            >
              <span className="pointer-events-none"><FaChevronDown /></span>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-1 rounded-md border border-foreground/15 bg-[var(--surface)] p-2 shadow-lg shadow-black/20">
            <div className="max-h-[220px] overflow-y-auto pr-1">
              {options.map((skill) => {
                const checked = value.includes(skill)
                return (
                  <label
                    key={skill}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm text-foreground transition hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleSkill(skill, event.target.checked)}
                      className="h-4 w-4 accent-foreground"
                    />
                    <span>{skill}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AuthErrorMessage id={`${label}-skill-error`} message={error ?? ""} className="mt-1" />
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
  const [submitErrorDetails, setSubmitErrorDetails] = useState("")

  const update = (field: FieldName, value: string | string[]) => {
    const next = { ...values, [field]: value } as FormValues
    const hideBranch = field === "university" && value !== "University of Jeddah"
    if (hideBranch) next.branch = ""
    setValues(next)
    if (errors[field]) {
      const error = validateField(field, next)
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
    const error = validateField(field, values)
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
      const error = validateField(field, values)
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

        const selectedSkills = values.committeeSkills[committee] ?? []
        if (!selectedSkills.length) {
          nextErrors[committeeSkillErrorKey(committee)] = "committeeSkillRequired"
        }
      })

      if (values.developerCommitteesLeader && !(values.globalRoleSkills.DEVELOPER_COMMITTEES_LEADER ?? []).length) {
        nextErrors.developerCommitteesLeaderSkills = "committeeSkillRequired"
      }

      if (values.advisor && !(values.globalRoleSkills.ADVISOR ?? []).length) {
        nextErrors.advisorSkills = "committeeSkillRequired"
      }
    }
    setErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length) return

    setErrors({})
    if (step === 1) {
      setStep(2)
      return
    }

    setSubmitError("")
    setSubmitErrorDetails("")
    setIsSubmitting(true)
    if (!API_ENABLED) {
      setSubmitError("apiRequired")
      setIsSubmitting(false)
      return
    }

    const skillsByCommittee = values.committees.reduce<Record<string, string[]>>((accumulator, committee) => {
      const selected = values.committeeSkills[committee] ?? []
      if (selected.length) {
        accumulator[committeeCodes[committee as CommitteeOption]] = selected
      }
      return accumulator
    }, {})

    if (values.developerCommitteesLeader && values.globalRoleSkills.DEVELOPER_COMMITTEES_LEADER?.length) {
      skillsByCommittee.DEVELOPER_COMMITTEES_LEADER = values.globalRoleSkills.DEVELOPER_COMMITTEES_LEADER
    }

    if (values.advisor && values.globalRoleSkills.ADVISOR?.length) {
      skillsByCommittee.ADVISOR = values.globalRoleSkills.ADVISOR
    }

    const applicationData = {
      phoneNumber: `+966${values.phone}`,
      ...(values.universityEmail ? { universityEmail: values.universityEmail } : {}),
      university: values.university,
      ...(values.branch ? { branch: values.branch } : {}),
      college: values.college,
      major: values.major,
      level: values.level,
      gender: values.gender,
      ...(Object.keys(skillsByCommittee).length ? { skillsByCommittee } : {}),
    }

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
        universityEmail: values.universityEmail || undefined,
        password: values.password,
        registrationType: membership === "member" ? "MEMBER" : "NON_MEMBER",
        applicationData,
        committees: membership === "member" ? values.committees.map((committee) => ({
          committeeCode: committeeCodes[committee as CommitteeOption],
          requestedRole: values.committeeRoles[committee],
        })) : [],
        requestedGlobalRoles: membership === "member" ? [
          ...(values.developerCommitteesLeader ? ["DEVELOPER_COMMITTEES_LEADER"] : []),
          ...(values.advisor ? ["ADVISOR"] : []),
        ] : [],
      },
    })
    if (!result.ok) {
      if (result.code === "EMAIL_ALREADY_EXISTS") {
        setSubmitError("emailAlreadyExists")
      } else if (result.code === "EMAILS_MUST_DIFFER") {
        setSubmitError("signupEmailsMustDiffer")
      } else if (result.code === "SIGNUP_WEAK_PASSWORD") {
        setSubmitError("signupWeakPassword")
      } else if (result.code === "EMAIL_ADDRESS_NOT_AUTHORIZED") {
        setSubmitError("signupEmailNotAuthorized")
      } else if (result.code === "VALIDATION_ERROR" && result.details.length > 0) {
        setSubmitError("authRequestFailed")
        setSubmitErrorDetails(result.details.map(({ pointer, message }) => `${pointer || "form"}: ${message}`).join("; "))
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

    const pending = { email: values.personalEmail, universityEmail: values.universityEmail || null }
    window.sessionStorage.setItem("gdg.pending-signup", JSON.stringify(pending))
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
        committeeSkills: {},
        advisor: false,
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
      const committeeSkills = { ...current.committeeSkills }
      if (!checked) {
        delete committeeRoles[committee]
        delete committeeSkills[committee]
      }
      return { ...current, committees, committeeRoles, committeeSkills }
    })

    setErrors((current) => {
      const next = { ...current }
      delete next[committeeRoleErrorKey(committee)]
      delete next[committeeSkillErrorKey(committee)]
      if (checked && next.committees === "committeeRequired") delete next.committees
      return next
    })
  }

  const updateCommitteeSkills = (committee: string, skills: string[]) => {
    setValues((current) => ({
      ...current,
      committeeSkills: { ...current.committeeSkills, [committee]: skills },
    }))

    setErrors((current) => ({
      ...current,
      [committeeSkillErrorKey(committee)]: skills.length ? undefined : current[committeeSkillErrorKey(committee)] ? "committeeSkillRequired" : undefined,
    }))
  }

  const updateGlobalRoleSkills = (role: "DEVELOPER_COMMITTEES_LEADER" | "ADVISOR", skills: string[]) => {
    setValues((current) => ({
      ...current,
      globalRoleSkills: { ...current.globalRoleSkills, [role]: skills },
    }))

    setErrors((current) => ({
      ...current,
      [role === "DEVELOPER_COMMITTEES_LEADER" ? "developerCommitteesLeaderSkills" : "advisorSkills"]: skills.length ? undefined : current[role === "DEVELOPER_COMMITTEES_LEADER" ? "developerCommitteesLeaderSkills" : "advisorSkills"] ? "committeeSkillRequired" : undefined,
    }))
  }

  const toggleCommitteeSkill = (committee: string, skill: string, checked: boolean) => {
    const selected = new Set(values.committeeSkills[committee] ?? [])
    if (checked) selected.add(skill)
    else selected.delete(skill)
    updateCommitteeSkills(committee, [...selected])
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
      <TextField id="universityEmail" label={`${universityEmail} (${t("optional")})`} type="email" inputMode="email" value={values.universityEmail} onChange={(value) => update("universityEmail", value)} onBlur={() => blur("universityEmail")} error={errors.universityEmail} placeholder={t("fields.universityEmail.placeholder")} maxLength={254} autoComplete="email" required={false} />
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
        <AuthErrorMessage message={submitError} detailText={submitErrorDetails} className="mb-3" />
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
                      {committee.replace(/ Committee$/, "")}
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(values.developerCommitteesLeader)}
                      onChange={(event) => setValues((current) => ({ ...current, developerCommitteesLeader: event.target.checked }))}
                    />
                    Developer Committees Leader
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(values.advisor)}
                      onChange={(event) => setValues((current) => ({ ...current, advisor: event.target.checked }))}
                    />
                    Advisor
                  </label>
                </div>
                <AuthErrorMessage id="committees-error" message={errors.committees ?? ""} className="mt-1" />
                {values.committees.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
                    <p className="col-span-full text-sm text-foreground/65">
                      {t("fields.committeeRolesInstruction")}
                    </p>
                    {values.committees.map((committee, index) => {
                      const roleErrorKey = committeeRoleErrorKey(committee)
                      const skillErrorKey = committeeSkillErrorKey(committee)
                      const roleError = errors[roleErrorKey]
                      const skillOptions = committeeSkillOptions[committee as CommitteeOption] ?? []
                      const selectedSkills = values.committeeSkills[committee] ?? []
                      return (
                        <div key={committee} className="space-y-3">
                          <ChoiceField
                            id={`committee-role-${index}`}
                            label={`${t("fields.role.label")}: ${committee.replace(/ Committee$/, "")}`}
                            placeholder={t("fields.role.placeholder")}
                            options={roleOptions}
                            value={values.committeeRoles[committee] === "Advisor" ? "" : values.committeeRoles[committee] ?? ""}
                            error={roleError}
                            onChange={(role) => updateCommitteeRole(committee, role)}
                            onBlur={() => {
                              const role = values.committeeRoles[committee]
                              setErrors((current) => ({
                                ...current,
                                [roleErrorKey]: role ? undefined : "committeeRoleRequired",
                              }))
                            }}
                          />
                          <CommitteeSkillsPicker
                            label={t("fields.skills.label")}
                            options={skillOptions}
                            value={selectedSkills}
                            error={errors[skillErrorKey]}
                            onChange={(nextSkills) => updateCommitteeSkills(committee, nextSkills)}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {(values.developerCommitteesLeader || values.advisor) && (
                  <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
                    {values.developerCommitteesLeader && (
                      <div className="space-y-3">
                        <CommitteeSkillsPicker
                          label={t("fields.developerCommitteesLeader.label")}
                          options={globalRoleSkillOptions.DEVELOPER_COMMITTEES_LEADER}
                          value={values.globalRoleSkills.DEVELOPER_COMMITTEES_LEADER ?? []}
                          error={errors.developerCommitteesLeaderSkills}
                          onChange={(nextSkills) => updateGlobalRoleSkills("DEVELOPER_COMMITTEES_LEADER", nextSkills)}
                        />
                      </div>
                    )}

                    {values.advisor && (
                      <div className="space-y-3">
                        <CommitteeSkillsPicker
                          label={t("fields.role.advisor")}
                          options={globalRoleSkillOptions.ADVISOR}
                          value={values.globalRoleSkills.ADVISOR ?? []}
                          error={errors.advisorSkills}
                          onChange={(nextSkills) => updateGlobalRoleSkills("ADVISOR", nextSkills)}
                        />
                      </div>
                    )}
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
