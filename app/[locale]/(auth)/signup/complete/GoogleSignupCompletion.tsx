"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import AuthCard from "@/app/components/auth/AuthCard";
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage";
import {
  branchOptions,
  collegeOptions,
  committeeCodes,
  committeeOptions,
  genderOptions,
  getMajorOptions,
  levelOptions,
  universityOptions,
  type CommitteeOption,
} from "@/data/signup";
import { API_ENABLED, apiRequest } from "@/lib/api/client";
import { storeAuthSession } from "@/lib/auth/session";

type GoogleSignupProfile = { email: string; fullName: string };
type RegistrationType = "MEMBER" | "NON_MEMBER";

function Input({
  id, label, value, onChange, type = "text", placeholder, readOnly = false, required = true, maxLength = 255,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-medium">
      {label} {required && <span className="text-gdg-red" aria-hidden="true">*</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        className="mt-1.5 h-9 w-full rounded-md border border-foreground/15 bg-surface px-2.75 text-sm font-normal outline-none placeholder:text-foreground/40 read-only:opacity-70"
      />
    </label>
  );
}

function Select({
  id, label, value, options, onChange, disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly (string | { value: string; label: string })[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-medium">
      {label} <span className="text-gdg-red" aria-hidden="true">*</span>
      <select
        id={id}
        value={value}
        required
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-9 w-full rounded-md border border-foreground/15 bg-surface px-2.75 text-sm font-normal outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">—</option>
        {options.map((item) => {
          const option = typeof item === "string" ? { value: item, label: item } : item;
          return <option key={option.value} value={option.value}>{option.label}</option>;
        })}
      </select>
    </label>
  );
}

export default function GoogleSignupCompletion() {
  const t = useTranslations("auth.signup");
  const router = useRouter();
  const [profile, setProfile] = useState<GoogleSignupProfile | null>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType | "">("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [branch, setBranch] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [selectedCommittees, setSelectedCommittees] = useState<CommitteeOption[]>([]);
  const [committeeRoles, setCommitteeRoles] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void apiRequest<{ profile: GoogleSignupProfile }>("/account/profile-status").then(result => {
      if (!active) return;
      if (!result.ok) { router.replace("/login"); return; }
      setProfile(result.data.profile);
      setFullName(result.data.profile.fullName ?? "");
    });
    return () => { active = false; };
  }, [router]);

  const updateCollege = (value: string) => {
    setCollege(value);
    setMajor("");
  };

  const toggleCommittee = (committee: CommitteeOption) => {
    setSelectedCommittees((current) => current.includes(committee)
      ? current.filter((item) => item !== committee)
      : [...current, committee]);
    setCommitteeRoles((roles) => ({ ...roles, [committee]: roles[committee] || "Member" }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!profile || !API_ENABLED) {
      setFormError("authRequestFailed");
      return;
    }
    if (!/^5\d{8}$/.test(phone)) {
      setFormError("phoneFormat");
      return;
    }
    if (universityEmail.trim() && universityEmail.trim().toLowerCase() === profile.email.toLowerCase()) {
      setFormError("signupEmailsMustDiffer");
      return;
    }
    if (registrationType === "MEMBER") {
      const normalizedBranch = branch.trim();
      if (!normalizedBranch) {
        setFormError("branchRequired");
        return;
      }
      if (normalizedBranch.length > 100) {
        setFormError("branchTooLong");
        return;
      }
      if (/[\u0000-\u001F\u007F-\u009F]/.test(normalizedBranch)) {
        setFormError("branchInvalid");
        return;
      }
    }
    if (registrationType === "MEMBER" && selectedCommittees.length === 0) {
      setFormError("committeeRequired");
      return;
    }

    setIsSubmitting(true);
    const result = await apiRequest<{ registrationPendingApproval: boolean }>("/account/complete-profile", {
      method: "POST",
      body: {
        fullName,
        registrationType,
        applicationData: {
          phoneNumber: `+966${phone}`,
          ...(universityEmail.trim() ? { universityEmail: universityEmail.trim() } : {}),
          university,
          ...(registrationType === "MEMBER" ? { branch: branch.trim() } : {}),
          college,
          major,
          level,
          gender,
        },
        committees: registrationType === "MEMBER" ? selectedCommittees.map((committee) => ({
          committeeCode: committeeCodes[committee],
          requestedRole: committeeRoles[committee] || "Member",
        })) : [],
        requestedGlobalRoles: [],
      },
    });

    if (!result.ok) {
      if (result.code === "BRANCH_REQUIRED") setFormError("branchRequired");
      else if (result.code === "GOOGLE_ACCOUNT_LINK_REQUIRED") setFormError("googleAccountLinkRequired");
      else if (result.code === "EMAILS_MUST_DIFFER") setFormError("signupEmailsMustDiffer");
      else if (result.status === 401) setFormError("googleSessionExpired");
      else setFormError("authRequestFailed");
      setIsSubmitting(false);
      return;
    }

    try {

    } catch {
      // The backend session is already established; local Supabase cleanup is best effort.
    }
    window.sessionStorage.removeItem("gdg.google-signup-profile");
    storeAuthSession({ authenticated: true });
    if (result.data.registrationPendingApproval) router.replace("/signup/pending");
    else router.replace("/");
  };

  const fieldLabel = (key: string) => t(`fields.${key}.label`);
  const renderField = (id: string, label: string, value: string, setter: (value: string) => void, options: readonly (string | { value: string; label: string })[], disabled = false): ReactNode => (
    <Select id={id} label={label} value={value} options={options} onChange={setter} disabled={disabled} />
  );

  return (
    <main className="flex w-full flex-1 justify-center bg-background px-4 py-8 md:items-center md:px-6">
      <AuthCard
        size="lg"
        title={t("completeProfile.title")}
        description={t("completeProfile.description")}
        className="my-auto w-full max-w-3xl !px-5 !py-8 md:!max-w-3xl md:!px-8"
      >
        {!profile ? (
          <div className="w-full">
            <p className="text-sm text-foreground/70">{t("completeProfile.missingSession")}</p>
            <button type="button" onClick={() => router.replace("/login")} className="mt-5 h-9 w-full rounded-md bg-blue text-sm font-medium text-white">
              {t("signIn")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid w-full grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <AuthErrorMessage message={formError} className="col-span-full" />
            <fieldset className="col-span-full">
              <legend className="mb-3 text-sm font-medium">{t("membershipQuestion")} <span className="text-gdg-red">*</span></legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["MEMBER", "NON_MEMBER"] as const).map((choice) => (
                  <label key={choice} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm ${registrationType === choice ? "border-blue bg-blue/5" : "border-foreground/15"}`}>
                    <input type="radio" name="registrationType" required checked={registrationType === choice} onChange={() => setRegistrationType(choice)} />
                    {t(choice === "MEMBER" ? "memberChoice" : "nonMemberChoice")}
                  </label>
                ))}
              </div>
            </fieldset>

            <Input id="google-full-name" label={fieldLabel("fullName")} value={fullName} onChange={setFullName} />
            <Input id="google-personal-email" label={fieldLabel("personalEmail")} value={profile.email} readOnly />
            <Input id="google-phone" label={fieldLabel("phone")} value={phone} onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 9))} type="tel" placeholder="5XXXXXXXX" />
            <Input id="google-university-email" label={`${fieldLabel("universityEmail")} (${t("optional")})`} value={universityEmail} onChange={setUniversityEmail} type="email" required={false} />
            {renderField("google-gender", fieldLabel("gender"), gender, setGender, genderOptions.map(({ value, labelKey }) => ({ value, label: t(`options.gender.${labelKey}`) })))}
            {renderField("google-university", fieldLabel("university"), university, (value) => { setUniversity(value); setBranch(""); }, universityOptions)}
            {registrationType === "MEMBER" && university && (university === "University of Jeddah"
              ? renderField("google-branch", fieldLabel("branch"), branch, setBranch, branchOptions)
              : <Input id="google-branch" label={fieldLabel("branch")} value={branch} onChange={setBranch} placeholder={t("fields.branch.typePlaceholder")} maxLength={100} />)}
            {renderField("google-college", fieldLabel("college"), college, updateCollege, collegeOptions)}
            {renderField("google-major", fieldLabel("major"), major, setMajor, getMajorOptions(college), !college)}
            {renderField("google-level", fieldLabel("level"), level, setLevel, levelOptions)}

            {registrationType === "MEMBER" && (
              <fieldset className="col-span-full">
                <legend className="mb-2 text-sm font-medium">{fieldLabel("committees")} <span className="text-gdg-red">*</span></legend>
                <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  {committeeOptions.map((committee) => (
                    <label key={committee} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedCommittees.includes(committee)} onChange={() => toggleCommittee(committee)} />
                      {committee}
                    </label>
                  ))}
                </div>
                {selectedCommittees.length > 0 && <p className="mt-3 text-xs text-muted">{t("fields.committeeRolesInstruction")}</p>}
                {selectedCommittees.map((committee) => (
                  <label key={committee} className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span>{committee}</span>
                    <select value={committeeRoles[committee] || "Member"} onChange={(event) => setCommitteeRoles((current) => ({ ...current, [committee]: event.target.value }))} className="h-8 rounded-md border border-foreground/15 bg-surface px-2">
                      {["Member", "Co-Leader", "Leader"].map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </label>
                ))}
              </fieldset>
            )}

            <button type="submit" disabled={isSubmitting} className="col-span-full mt-2 h-9 rounded-md bg-blue text-sm font-medium text-white transition hover:bg-blue/90 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? t("creatingAccount") : t("completeProfile.submit")}
            </button>
          </form>
        )}
      </AuthCard>
    </main>
  );
}
