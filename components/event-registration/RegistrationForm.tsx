"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { RegistrationQuestion } from "@/components/dashboard/shared/types";
import { API_ENABLED, apiRequest } from "@/lib/api/client";
import { CHOICE_SEPARATOR, registerForEvent } from "@/lib/events/api";

export function RegistrationForm({
    onClose,
    questions = [],
    questionsLoading = false,
    questionsError = false,
    onRetryQuestions,
    eventId,
}: {
    onClose?: () => void;
    questions?: RegistrationQuestion[];
    questionsLoading?: boolean;
    questionsError?: boolean;
    onRetryQuestions?: () => void;
    /** When set, the form submits to the backend for this event. */
    eventId?: string;
}) {
    const t = useTranslations("eventRegistration");
    const tValidation = useTranslations("validation");

    // Name, email, phone, major and membership come from the account, so the
    // form only asks the event's own questions.
    const [registrant, setRegistrant] = useState<{ fullName: string; email: string | null } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [questionErrors, setQuestionErrors] = useState<Record<string, boolean>>({});
    const [result, setResult] = useState<{ ok: boolean; key: string; detail?: string } | null>(null);

    useEffect(() => {
        if (!API_ENABLED) return;
        let active = true;
        void apiRequest<{ fullName: string; email: string | null }>("/me").then((result) => {
            if (active && result.ok) setRegistrant(result.data);
        });
        return () => { active = false; };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;

        if (questionsLoading || questionsError) return;
        const missingAnswers = Object.fromEntries(questions
            .filter((question) => question.required && !answers[question.id]?.trim())
            .map((question) => [question.id, true]));
        setQuestionErrors(missingAnswers);

        if (Object.keys(missingAnswers).length > 0) return;
        if (!eventId) return;
        setIsSubmitting(true);
        const outcome = await registerForEvent(eventId, questions, answers);
        setIsSubmitting(false);
        const known = ["ALREADY_REGISTERED", "REGISTRATION_CLOSED", "UNAUTHORIZED", "VALIDATION_ERROR"];
        setResult(
            outcome.ok
                ? { ok: true, key: "result.success" }
                : {
                    ok: false,
                    key: `result.${known.includes(outcome.code) ? outcome.code : "error"}`,
                    detail: outcome.details.map((item) => item.message).join(" "),
                },
        );
    }

    const inputClassName =
        "mt-2 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-gdg-blue focus:ring-2 focus:ring-gdg-blue/20";

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
                    {registrant && (
                        <p className="rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-start text-sm text-foreground">
                            {t("registeringAs", { name: registrant.fullName })}
                            {registrant.email && <span className="block text-xs text-muted">{registrant.email}</span>}
                        </p>
                    )}

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
                                        const selected = (answers[question.id] ?? "").split(CHOICE_SEPARATOR).filter(Boolean);
                                        return <label key={option} className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={selected.includes(option)} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.checked ? [...selected, option].join(CHOICE_SEPARATOR) : selected.filter((value) => value !== option).join(CHOICE_SEPARATOR) }))} className="size-4 accent-[var(--gdg-dark)]" />{option}</label>;
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

                    {questionsLoading && (
                        <p role="status" className="mt-5 text-sm text-muted">
                            {t("questionsLoading")}
                        </p>
                    )}
                    {questionsError && (
                        <div role="alert" className="mt-5 text-sm text-gdg-red">
                            <p>{t("questionsUnavailable")}</p>
                            {onRetryQuestions && (
                                <button type="button" onClick={onRetryQuestions} className="mt-2 font-semibold underline">
                                    {t("retryQuestions")}
                                </button>
                            )}
                        </div>
                    )}

                    {result && (
                        <p role="status" className={`mt-6 text-start text-sm ${result.ok ? "text-gdg-green" : "text-gdg-red"}`}>
                            {t(result.key)}
                            {result.detail && <span className="mt-1 block text-xs">{result.detail}</span>}
                        </p>
                    )}

                    <div className="mt-auto flex justify-end pt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting || result?.ok || questionsLoading || questionsError}
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
