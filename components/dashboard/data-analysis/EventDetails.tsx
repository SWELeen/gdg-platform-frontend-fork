"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CalendarSearch,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  Send,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";
import { leaderCommitteeConfig } from "../shared/committee-config";
import { ConfirmModal } from "../shared/ConfirmModal";
import type { EventStatus } from "../shared/types";
import { EditEventModal } from "./EditEventModal";
import { questionTypeKeys, registrantFieldKeyByValue } from "./event-form-config";

const statusStyles: Record<EventStatus, { key: string; className: string; dot: string }> = {
  Upcoming: {
    key: "upcoming",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    dot: "bg-blue-600",
  },
  Completed: {
    key: "completed",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    dot: "bg-emerald-600",
  },
  Draft: {
    key: "draft",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  "Needs Update": {
    key: "needsUpdate",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    dot: "bg-amber-600",
  },
};

function DetailItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}

/** Leader-facing details for one committee event (Data Analysis dashboard). */
export function EventDetails({ eventId }: { eventId: string }) {
  const t = useTranslations("dashboard.leader");
  const tc = useTranslations("dashboard.leader.createEvent");
  const router = useRouter();
  const { events, committee, canManageEvents, deleteEvent, publishDraft } = useLeaderDashboard();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Set once a delete is confirmed so the "not found" state doesn't flash before navigation.
  const [isLeaving, setIsLeaving] = useState(false);

  const eventsPath = `${leaderCommitteeConfig[committee].routeBase}/events`;
  const event = events.find((item) => item.id === eventId);

  const backLink = (
    <Link
      href={eventsPath}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
    >
      <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      {t("eventDetails.back")}
    </Link>
  );

  if (!event && isLeaving) return null;

  if (!event) {
    return (
      <div className="space-y-6">
        {backLink}
        <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
          <CalendarSearch className="mx-auto size-10 text-muted" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-foreground">{t("eventDetails.notFoundTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("eventDetails.notFoundDescription")}</p>
          <Link
            href={eventsPath}
            className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            {t("eventDetails.back")}
          </Link>
        </section>
      </div>
    );
  }

  const status = statusStyles[event.status];
  const percent = event.capacity > 0 ? Math.min(100, Math.round((event.registered / event.capacity) * 100)) : 0;
  const registrantFields = event.requiredRegistrantFields ?? [];
  const questions = event.registrationQuestions ?? [];

  return (
    <div className="space-y-6">
      {backLink}

      <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- in-session blob: URL from the create form; next/image cannot optimize it.
          <img src={event.imageUrl} alt="" className="h-48 w-full object-cover sm:h-64" />
        ) : (
          <div aria-hidden="true" className="h-2 w-full bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-yellow" />
        )}

        <div className="p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {t(`eventFilters.${event.type.toLowerCase()}`)}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                  <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                  {t(`eventFilters.${status.key}`)}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{event.title}</h2>
              <p className="mt-1 text-xs text-muted">
                {t("eventDetails.createdUpdated", { created: event.created, updated: event.updated })}
              </p>
            </div>

            {canManageEvents && (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {event.isDraft && (
                  <button
                    type="button"
                    onClick={() => publishDraft(event.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <Send className="size-3.5" aria-hidden="true" />
                    {t("eventForm.publish")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  {t("eventManagement.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  {t("eventManagement.delete")}
                </button>
              </div>
            )}
          </div>

          {event.isDraft && (
            <p className="mt-4 rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-xs text-muted">
              {t("eventDetails.draftNotice")}
            </p>
          )}

          {event.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-foreground/80">{event.description}</p>
          )}

          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={<Calendar className="size-4" />} label={t("eventManagement.date")}>
              {event.date}
            </DetailItem>
            <DetailItem icon={<Clock className="size-4" />} label={t("eventManagement.time")}>
              {event.time}
            </DetailItem>
            <DetailItem icon={<MapPin className="size-4" />} label={t("eventManagement.location")}>
              <span>{event.location}</span>
              {event.mapsLink && (
                <a
                  href={event.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {tc("preview.openMap")}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              )}
            </DetailItem>
            <DetailItem icon={<UsersRound className="size-4" />} label={tc("preview.speakers")}>
              {event.speakers || t("eventDetails.notProvided")}
            </DetailItem>
            <DetailItem icon={<Users className="size-4" />} label={t("eventDetails.capacity")}>
              {event.isDraft ? (
                tc("preview.capacityValue", { count: event.capacity })
              ) : (
                <>
                  {t("eventManagement.seatsFilled", {
                    registered: event.registered,
                    capacity: event.capacity,
                    percent,
                  })}
                  <span className="mt-1.5 block h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-surface-muted">
                    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                  </span>
                </>
              )}
            </DetailItem>
            <DetailItem icon={<CalendarClock className="size-4" />} label={tc("preview.deadline")}>
              {event.registrationDeadline || t("eventDetails.notProvided")}
            </DetailItem>
          </dl>

          <section className="mt-6 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{tc("preview.requirements")}</h3>
              <p className="mt-0.5 whitespace-pre-line text-sm text-muted">
                {event.requirements || tc("preview.noRequirements")}
              </p>
            </div>
          </section>

          {(registrantFields.length > 0 || questions.length > 0) && (
            <section className="mt-6 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground">{tc("preview.registrationInfo")}</h3>
              {registrantFields.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {registrantFields.map((field) => {
                    const key = registrantFieldKeyByValue[field];
                    return (
                      <li
                        key={field}
                        className="rounded-full border border-border bg-surface-muted/60 px-3 py-1 text-xs text-foreground/80"
                      >
                        {key ? tc(`registration.fields.${key}`) : field}
                      </li>
                    );
                  })}
                </ul>
              )}
              {questions.length > 0 && (
                <>
                  <h4 className="mt-5 text-sm font-semibold text-foreground">{tc("preview.questions")}</h4>
                  <ol className="mt-3 space-y-2">
                    {questions.map((question, index) => (
                      <li key={question.id} className="rounded-xl border border-border p-3 text-sm text-foreground">
                        <p className="font-medium">
                          {index + 1}. {question.text}
                          {questionTypeKeys[question.type] && (
                            <span className="ms-2 text-xs font-normal text-muted">
                              ({tc(`questions.types.${questionTypeKeys[question.type]}`)})
                            </span>
                          )}
                        </p>
                        {question.options && (
                          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                            {question.options.map((option) => (
                              <li key={option}>
                                {question.type === "yes-no"
                                  ? tc(option === "Yes" ? "questions.yes" : "questions.no")
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
          )}
        </div>
      </article>

      <EditEventModal isOpen={editing} onClose={() => setEditing(false)} event={event} />

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setIsLeaving(true);
          deleteEvent(event.id);
          router.replace(eventsPath);
        }}
        title={t("eventManagement.delete")}
        message={t("eventManagement.deleteMessage", { name: event.title })}
        confirmText={t("eventManagement.delete")}
        cancelText={t("eventForm.cancel")}
        danger
      />
    </div>
  );
}
