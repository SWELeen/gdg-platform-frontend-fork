"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Calendar,
  CalendarClock,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { parseEventDate } from "@/lib/dashboard/event-format";
import type { CommitteeEventDetails } from "@/lib/committee-dashboard/api";
import { useDialog } from "../shared/useDialog";
import { registrantFieldKeys, questionTypeKeys, type DraftQuestion } from "./event-form-config";

export interface EventPreviewData {
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd from the form
  time: string; // HH:mm from the form
  location: string;
  mapsLink: string;
  speakers: string;
  capacity: string;
  registrationDeadline: string; // ISO yyyy-mm-dd
  requirements: string;
  imageUrl: string | null;
  questions: DraftQuestion[];
}

const RIYADH = "Asia/Riyadh";
const QUESTION_TYPES_FROM_API: Record<string, string> = {
  TEXT: "short-answer",
  RADIO: "single-choice",
  SELECT: "single-choice",
  CHECKBOX: "checkboxes",
};

/** A saved event (for example a draft) in the shape the preview shows, with times in the club's time zone. */
export function toEventPreviewData(event: CommitteeEventDetails): EventPreviewData {
  const date = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: RIYADH }).format(new Date(iso));
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: RIYADH, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(new Date(event.startsAt));
  return {
    title: event.name,
    description: event.description ?? "",
    date: date(event.startsAt),
    time,
    location: event.location ?? "",
    mapsLink: event.mapsLink ?? "",
    speakers: event.speakers ?? "",
    capacity: String(event.capacity),
    registrationDeadline: date(event.registrationDeadline),
    requirements: event.requirements ?? "",
    imageUrl: event.imageUrl,
    questions: event.questions.map((question) => ({
      id: String(question.questionId),
      type: QUESTION_TYPES_FROM_API[question.questionType] ?? "short-answer",
      text: question.questionText,
      required: question.isRequired,
      ...(question.options ? { options: question.options } : {}),
    })),
  };
}

function PreviewDetail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gdg-blue-light text-gdg-blue">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <div className="mt-0.5 break-words text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

/** Event preview dialog matching the "Event Preview" design (Create Event, screen 2). */
export function EventPreviewModal({
  data,
  onEdit,
  onPublish,
  editLabel,
}: {
  data: EventPreviewData;
  onEdit: () => void;
  onPublish: () => void;
  /** Replaces "Edit" when the preview is opened outside the form, e.g. for a saved draft. */
  editLabel?: string;
}) {
  const t = useTranslations("dashboard.leader.createEvent");
  const format = useFormatter();
  const dialogRef = useDialog<HTMLDivElement>(onEdit);

  const eventDate = parseEventDate(data.date);
  const deadlineDate = parseEventDate(data.registrationDeadline);
  const [hours, minutes] = data.time.split(":").map(Number);
  const timeDate = eventDate && Number.isFinite(hours) && Number.isFinite(minutes)
    ? new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), hours, minutes)
    : null;
  const dateOptions = { dateStyle: "long", numberingSystem: "latn" } as const;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onEdit();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-preview-title"
        tabIndex={-1}
        className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface text-foreground shadow-2xl outline-none sm:max-h-[90vh]"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
          <h2 id="event-preview-title" className="text-xl font-bold sm:text-2xl">
            {t("preview.title")}
          </h2>
          <button
            type="button"
            onClick={onEdit}
            aria-label={t("preview.close")}
            className="flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-2 pt-4 sm:px-7">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob: URL of the selected file; next/image cannot optimize it.
            <img
              src={data.imageUrl}
              alt={t("preview.imageAlt")}
              className="h-44 w-full rounded-2xl object-cover sm:h-56"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-44 w-full rounded-2xl bg-gradient-to-br from-gdg-blue via-gdg-red to-gdg-yellow sm:h-56"
            />
          )}

          <h3 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">{data.title}</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{data.description}</p>

          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-y border-border py-5 sm:grid-cols-2">
            <PreviewDetail icon={<Calendar className="size-4" />} label={t("preview.date")}>
              {eventDate ? format.dateTime(eventDate, dateOptions) : data.date}
            </PreviewDetail>
            <PreviewDetail icon={<Clock className="size-4" />} label={t("preview.time")}>
              {timeDate ? format.dateTime(timeDate, { timeStyle: "short", numberingSystem: "latn" }) : data.time}
            </PreviewDetail>
            <PreviewDetail icon={<MapPin className="size-4" />} label={t("preview.location")}>
              <span>{data.location}</span>
              {data.mapsLink && (
                <a
                  href={data.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold text-gdg-blue hover:underline"
                >
                  {t("preview.openMap")}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              )}
            </PreviewDetail>
            <PreviewDetail icon={<UsersRound className="size-4" />} label={t("preview.speakers")}>
              {data.speakers || t("preview.none")}
            </PreviewDetail>
            <PreviewDetail icon={<Users className="size-4" />} label={t("preview.capacity")}>
              {t("preview.capacityValue", { count: Number(data.capacity) })}
            </PreviewDetail>
            <PreviewDetail icon={<CalendarClock className="size-4" />} label={t("preview.deadline")}>
              {deadlineDate ? format.dateTime(deadlineDate, dateOptions) : data.registrationDeadline}
            </PreviewDetail>
          </div>

          <div className="flex items-start gap-3 py-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gdg-blue-light text-gdg-blue">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t("preview.requirements")}</p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-muted">
                {data.requirements || t("preview.noRequirements")}
              </p>
            </div>
          </div>

          <section aria-labelledby="event-preview-registration" className="border-t border-border py-5">
            <h4 id="event-preview-registration" className="text-sm font-semibold">
              {t("preview.registrationInfo")}
            </h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {registrantFieldKeys.map((key) => (
                <li
                  key={key}
                  className="rounded-full border border-border bg-surface-muted/60 px-3 py-1 text-xs text-foreground/80"
                >
                  {t(`registration.fields.${key}`)}
                </li>
              ))}
            </ul>

            {data.questions.length > 0 && (
              <>
                <h4 className="mt-5 text-sm font-semibold">{t("preview.questions")}</h4>
                <ol className="mt-3 space-y-2">
                  {data.questions.map((question, index) => (
                    <li key={question.id} className="rounded-xl border border-border p-3 text-sm">
                      <p className="font-medium">
                        {index + 1}. {question.text}
                        <span className="ms-2 text-xs font-normal text-muted">
                          ({t(`questions.types.${questionTypeKeys[question.type]}`)} ·{" "}
                          {question.required ? t("questions.requiredBadge") : t("questions.optionalBadge")})
                        </span>
                      </p>
                      {question.options && (
                        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                          {question.options.map((option) => (
                            <li key={option}>
                              {question.type === "yes-no"
                                ? t(option === "Yes" ? "questions.yes" : "questions.no")
                                : option}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onEdit}
            className="min-w-[110px] rounded-lg border border-gdg-blue px-5 py-2.5 text-sm font-semibold text-gdg-blue transition hover:bg-gdg-blue/5"
          >
            {editLabel ?? t("preview.edit")}
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="min-w-[110px] rounded-lg bg-gdg-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gdg-blue/90"
          >
            {t("preview.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}
