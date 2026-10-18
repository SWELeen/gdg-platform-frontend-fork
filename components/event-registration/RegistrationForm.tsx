"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import {
    defaultPhoneCountryCode,
    eventRegistrationMembershipValues,
} from "@/data/signup";
import { validateEmail } from "@/app/lib/validation/email";
import { validateRequiredText } from "@/app/lib/validation/text";
import { validatePhone } from "@/app/lib/validation/phone";
import type { RegistrationQuestion } from "@/components/dashboard/shared/types";

type FormData = {
    fullName: string;
    universityId: string;
    college: string;
    major: string;
    phone: string;
    email: string;
    membership: "" | (typeof eventRegistrationMembershipValues)[number];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
    fullName: "",
    universityId: "",
    college: "",
    major: "",
    phone: "",
    email: "",
    membership: "",
};

export function RegistrationForm({
    onClose,
    questions = [],
}: {
    onClose?: () => void;
    questions?: RegistrationQuestion[];
}) {
    const t = useTranslations("eventRegistration");
    const tValidation = useTranslations("validation");

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [questionErrors, setQuestionErrors] = useState<Record<string, boolean>>({});

    function updateField<K extends keyof FormData>(
        field: K,
        value: FormData[K],
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((current) => ({
                ...current,
                [field]: undefined,
            }));
        }
    }

    function validateForm() {
        const newErrors: FormErrors = {};

        const fullNameError = validateRequiredText(
            formData.fullName,
            "fullName",
        );

        if (fullNameError) {
            newErrors.fullName = fullNameError;
        } else if (!/^[\p{L}\s.'’-]+$/u.test(formData.fullName.trim())) {
            newErrors.fullName = "nameInvalid";
        }

        const universityIdError = validateRequiredText(
            formData.universityId,
            "universityId",
        );

        if (universityIdError) {
            newErrors.universityId = universityIdError;
        } else if (!/^\d+$/.test(formData.universityId.trim())) {
            newErrors.universityId = "studentIdNumeric";
        }
        if (!formData.college.trim()) {
            newErrors.college = "collegeRequired";
        }

        if (!formData.major.trim()) {
            newErrors.major = "majorRequired";
        }

        const emailError = validateEmail(formData.email);

        if (emailError) {
            newErrors.email = emailError;
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "fieldRequired";
        } else {
            const phoneError = validatePhone(formData.phone);

            if (phoneError) {
                newErrors.phone = phoneError;
            }
        }

        if (!formData.membership) {
            newErrors.membership = "fieldRequired";
        }

        return newErrors;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;

        const validationErrors = validateForm();
        const missingAnswers = Object.fromEntries(questions
            .filter((question) => question.required && !answers[question.id]?.trim())
            .map((question) => [question.id, true]));
        setQuestionErrors(missingAnswers);

        if (Object.keys(validationErrors).length > 0 || Object.keys(missingAnswers).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        setIsSubmitting(false);
    }

    const inputClassName =
        "mt-2 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-gdg-blue focus:ring-2 focus:ring-gdg-blue/20";

    function errorClass(hasError: boolean) {
        return hasError ? " border-gdg-red focus:border-gdg-red" : "";
    }

    return (
        <section className="bg-surface px-6 py-7 sm:px-8 lg:px-8 xl:px-12">
            <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
                <div className="flex items-start justify-between gap-5">
                    <div className="text-start">
                        <p className="text-sm uppercase tracking-wide text-foreground/70">
                            {t("eyebrow")}
                        </p>

                        <h2 className="mt-1 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                            {t("title")}
                        </h2>

                        <p className="mt-4 text-sm text-muted">
                            {t("subtitle")}
                        </p>
                    </div>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t("close")}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl font-light text-foreground transition-colors hover:bg-surface-muted"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    )}
                </div>

                <form
                    className="mt-5 flex flex-1 flex-col"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-start text-sm font-semibold text-foreground"
                        >
                            {t("fullName")} <span className="text-gdg-red">*</span>
                        </label>

                        <div className="relative">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="absolute start-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-muted"
                            >
                                <path d="M20 21a8 8 0 0 0-16 0" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>

                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                placeholder={t("fullNamePlaceholder")}
                                value={formData.fullName}
                                onChange={(event) =>
                                    updateField("fullName", event.target.value)
                                }
                                aria-invalid={Boolean(errors.fullName)}
                                aria-describedby={
                                    errors.fullName ? "fullName-error" : undefined
                                }
                                className={
                                    inputClassName +
                                    " ps-10" +
                                    errorClass(Boolean(errors.fullName))
                                }
                            />
                        </div>

                        {errors.fullName && (
                            <p
                                id="fullName-error"
                                className="mt-1 text-start text-xs text-gdg-red"
                            >
                                {tValidation(errors.fullName)}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="universityId"
                                className="block text-start text-sm font-semibold text-foreground"
                            >
                                {t("universityId")} <span className="text-gdg-red">*</span>
                            </label>

                            <input
                                id="universityId"
                                name="universityId"
                                type="text"
                                inputMode="numeric"
                                placeholder={t("universityIdPlaceholder")}
                                value={formData.universityId}
                                onChange={(event) =>
                                    updateField("universityId", event.target.value)
                                }
                                aria-invalid={Boolean(errors.universityId)}
                                aria-describedby={
                                    errors.universityId ? "universityId-error" : undefined
                                }
                                className={
                                    inputClassName +
                                    errorClass(Boolean(errors.universityId))
                                }
                            />

                            {errors.universityId && (
                                <p
                                    id="universityId-error"
                                    className="mt-1 text-start text-xs text-gdg-red"
                                >
                                    {tValidation(errors.universityId)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="college"
                                className="block text-start text-sm font-semibold text-foreground"
                            >
                                {t("college")} <span className="text-gdg-red">*</span>
                            </label>

                            <input
                                id="college"
                                name="college"
                                type="text"
                                placeholder={t("collegePlaceholder")}
                                value={formData.college}
                                onChange={(event) =>
                                    updateField("college", event.target.value)
                                }
                                aria-invalid={Boolean(errors.college)}
                                aria-describedby={
                                    errors.college ? "college-error" : undefined
                                }
                                className={
                                    inputClassName +
                                    errorClass(Boolean(errors.college))
                                }
                            />

                            {errors.college && (
                                <p
                                    id="college-error"
                                    className="mt-1 text-start text-xs text-gdg-red"
                                >
                                    {tValidation(errors.college)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="major"
                                className="block text-start text-sm font-semibold text-foreground"
                            >
                                {t("major")} <span className="text-gdg-red">*</span>
                            </label>

                            <input
                                id="major"
                                name="major"
                                type="text"
                                placeholder={t("majorPlaceholder")}
                                value={formData.major}
                                onChange={(event) =>
                                    updateField("major", event.target.value)
                                }
                                aria-invalid={Boolean(errors.major)}
                                aria-describedby={
                                    errors.major ? "major-error" : undefined
                                }
                                className={
                                    inputClassName +
                                    errorClass(Boolean(errors.major))
                                }
                            />

                            {errors.major && (
                                <p
                                    id="major-error"
                                    className="mt-1 text-start text-xs text-gdg-red"
                                >
                                    {tValidation(errors.major)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-start text-sm font-semibold text-foreground"
                            >
                                {t("phone")} <span className="text-gdg-red">*</span>
                            </label>

                            <div
                                className={
                                    "mt-2 flex h-10 overflow-hidden rounded-md border border-border bg-surface transition focus-within:border-gdg-blue focus-within:ring-2 focus-within:ring-gdg-blue/20" +
                                    errorClass(Boolean(errors.phone))
                                }
                            >
                                <span className="flex items-center border-e border-border px-3 text-sm font-semibold text-foreground">
                                    {defaultPhoneCountryCode}
                                </span>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder={t("phonePlaceholder")}
                                    value={formData.phone}
                                    onChange={(event) =>
                                        updateField("phone", event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.phone)}
                                    aria-describedby={
                                        errors.phone ? "phone-error" : undefined
                                    }
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted"
                                />
                            </div>

                            {errors.phone && (
                                <p
                                    id="phone-error"
                                    className="mt-1 text-start text-xs text-gdg-red"
                                >
                                    {tValidation(errors.phone)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label
                            htmlFor="email"
                            className="block text-start text-sm font-semibold text-foreground"
                        >
                            {t("email")} <span className="text-gdg-red">*</span>
                        </label>

                        <div className="relative">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="absolute start-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-muted"
                            >
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-10 5L2 7" />
                            </svg>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder={t("emailPlaceholder")}
                                value={formData.email}
                                onChange={(event) =>
                                    updateField("email", event.target.value)
                                }
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email ? "email-error" : undefined
                                }
                                className={
                                    inputClassName +
                                    " ps-10" +
                                    errorClass(Boolean(errors.email))
                                }
                            />
                        </div>

                        {errors.email && (
                            <p
                                id="email-error"
                                className="mt-1 text-start text-xs text-gdg-red"
                            >
                                {tValidation(errors.email)}
                            </p>
                        )}
                    </div>

                    <fieldset
                        className="mt-5"
                        aria-describedby={
                            errors.membership ? "membership-error" : undefined
                        }
                    >
                        <legend className="text-start text-sm font-semibold text-foreground">
                            {t("membershipQuestion")}{" "}
                            <span className="text-gdg-red">*</span>
                        </legend>

                        <div className="mt-3 flex flex-wrap gap-x-16 gap-y-3">
                            {eventRegistrationMembershipValues.map((membership) => (
                                <label key={membership} className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
                                    <input
                                        type="radio"
                                        name="membership"
                                        value={membership}
                                        checked={formData.membership === membership}
                                        onChange={() => updateField("membership", membership)}
                                        className="h-4 w-4 accent-[var(--gdg-dark)]"
                                    />
                                    {t(`membership.${membership}`)}
                                </label>
                            ))}
                        </div>

                        {errors.membership && (
                            <p
                                id="membership-error"
                                className="mt-1 text-start text-xs text-gdg-red"
                            >
                                {tValidation(errors.membership)}
                            </p>
                        )}
                    </fieldset>

                    {questions.map((question) => (
                        <div key={question.id} className="mt-5">
                            <label htmlFor={`custom-question-${question.id}`} className="block text-start text-sm font-semibold text-foreground">
                                {question.text}{question.required && <span className="text-gdg-red">{" "}*</span>}
                            </label>
                            {question.type === "long-answer" ? (
                                <textarea id={`custom-question-${question.id}`} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} className="mt-2 min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-gdg-blue focus:ring-2 focus:ring-gdg-blue/20" />
                            ) : question.options?.length && ["multiple-choice", "checkboxes"].includes(question.type) ? (
                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                                    {question.options.map((option) => {
                                        const selected = (answers[question.id] ?? "").split(", ").filter(Boolean);
                                        return <label key={option} className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={selected.includes(option)} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.checked ? [...selected, option].join(", ") : selected.filter((value) => value !== option).join(", ") }))} className="size-4 accent-[var(--gdg-dark)]" />{option}</label>;
                                    })}
                                </div>
                            ) : question.options?.length ? (
                                <select id={`custom-question-${question.id}`} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-gdg-blue focus:ring-2 focus:ring-gdg-blue/20">
                                    <option value="">Select an answer</option>
                                    {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            ) : (
                                <input id={`custom-question-${question.id}`} type="text" value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} className={inputClassName} />
                            )}
                            {questionErrors[question.id] && <p className="mt-1 text-start text-xs text-gdg-red">{tValidation("fieldRequired")}</p>}
                        </div>
                    ))}

                    <div className="mt-auto flex justify-end pt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-10 items-center justify-center gap-3 rounded-md bg-gdg-dark px-4 text-sm font-medium text-[var(--white)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span>
                                {isSubmitting ? t("submitting") : t("submit")}
                            </span>

                            <span
                                aria-hidden="true"
                                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--white)]/60 text-base"
                            >
                                ↗
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
