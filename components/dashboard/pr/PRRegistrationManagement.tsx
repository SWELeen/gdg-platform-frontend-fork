"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";
import type {
  EventRegistration,
  RegistrationConfirmationStatus,
  RegistrationStatus,
} from "../shared/types";
import {
  prEventStatusFilterOptions,
  prRegistrationStatusFilterOptions,
} from "./mock-data";
import { ConfirmModal } from "../shared/ConfirmModal";
import { PRAttendancePanel } from "./PRAttendancePanel";
import { CreateEventModal } from "../data-analysis/CreateEventForm";
import { EventPreviewModal, toEventPreviewData, type EventPreviewData } from "../data-analysis/EventPreviewModal";
import { API_ENABLED } from "@/lib/api/client";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Search,
  Users,
  ClipboardList,
  CircleCheck,
  CircleX,
  Eye,
  ListPlus,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

function RegistrationStatusBadge({
  status,
  confirmationStatus,
  waitlistPosition,
}: {
  status: RegistrationStatus;
  confirmationStatus?: RegistrationConfirmationStatus;
  waitlistPosition?: number;
}) {
  const t = useTranslations("dashboard.leader");
  const label = status === "Waitlisted"
    ? waitlistPosition ? t("registrations.statuses.waitlistPosition", { position: waitlistPosition }) : t("registrations.statuses.waitlisted")
    : status === "Accepted" && confirmationStatus === "NotSent" ? t("registrations.statuses.confirmationNeeded")
    : status === "Accepted" && confirmationStatus === "Pending" ? t("registrations.statuses.awaitingConfirmation")
    : status === "Accepted" && confirmationStatus === "Confirmed" ? t("registrations.statuses.confirmed")
    : status === "Accepted" && confirmationStatus === "Declined" ? t("registrations.statuses.confirmationDeclined")
    : status === "Accepted" && confirmationStatus === "Expired" ? t("registrations.statuses.confirmationExpired")
    : status === "Pending" ? t("registrations.statuses.pending")
    : status === "Accepted" ? t("registrations.statuses.accepted")
    : t("registrations.statuses.rejected");
  const style = status === "Pending"
    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
    : status === "Waitlisted"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
      : status === "Rejected" || confirmationStatus === "Declined" || confirmationStatus === "Expired"
        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
        : confirmationStatus === "NotSent" || confirmationStatus === "Pending"
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
  const dotStyle = status === "Pending"
    ? "bg-amber-500"
    : status === "Waitlisted" || (status === "Accepted" && (confirmationStatus === "NotSent" || confirmationStatus === "Pending"))
      ? "bg-blue-500"
      : status === "Rejected" || confirmationStatus === "Declined" || confirmationStatus === "Expired"
        ? "bg-rose-500"
        : "bg-emerald-500";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style}`}>
      <span className={`size-1.5 rounded-full ${dotStyle}`} />
      {label}
    </span>
  );
}

function RegistrationCounts({ eventId }: { eventId: string }) {
  const { registrations } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader");
  const eventRegistrations = registrations.filter((item) => item.eventId === eventId);
  const pending = eventRegistrations.filter((item) => item.status === "Pending").length;
  const accepted = eventRegistrations.filter((item) => item.status === "Accepted").length;
  const rejected = eventRegistrations.filter((item) => item.status === "Rejected").length;
  const waitlisted = eventRegistrations.filter((item) => item.status === "Waitlisted").length;
  const awaitingConfirmation = eventRegistrations.filter(
    (item) => item.status === "Accepted" &&
      (item.confirmationStatus === "NotSent" || item.confirmationStatus === "Pending")
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
      <span className="font-semibold text-foreground">{t("registrations.total", { count: eventRegistrations.length })}</span>
      <span className="text-amber-700 dark:text-amber-300">{t("registrations.pendingCount", { count: pending })}</span>
      <span className="text-emerald-700 dark:text-emerald-300">{t("registrations.acceptedCount", { count: accepted })}</span>
      <span className="text-rose-700 dark:text-rose-300">{t("registrations.rejectedCount", { count: rejected })}</span>
      <span className="text-blue-700 dark:text-blue-300">{t("registrations.waitlistedCount", { count: waitlisted })}</span>
      <span className="text-muted">{t("registrations.confirmationOutstandingCount", { count: awaitingConfirmation })}</span>
    </div>
  );
}

export function PROverviewRegistrations() {
  const { events, registrations } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader");
  const pending = registrations
    .filter((registration) => registration.status === "Pending")
    .slice(0, 5);
  const upcomingEvents = events.filter((event) => event.status === "Upcoming").slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 p-5">
          <div>
            <h2 className="text-base font-bold text-foreground">{t("registrations.pendingTitle")}</h2>
            <p className="text-xs text-muted">{t("registrations.pendingDescription")}</p>
          </div>
          <Link
            href="/dashboard/pr-dashboard/events"
            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
          >
            {t("registrations.viewAllRegistrations")}
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="p-5 text-sm text-muted">{t("registrations.emptyPending")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 text-start">{t("registrations.applicant")}</th>
                  <th className="px-4 py-3 text-start">{t("registrations.event")}</th>
                  <th className="px-4 py-3 text-start">{t("registrations.registrationDate")}</th>
                  <th className="px-4 py-3 text-start">{t("registrations.status")}</th>
                  <th className="px-5 py-3 text-end">{t("registrations.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pending.map((registration) => {
                  const event = events.find((item) => item.id === registration.eventId);
                  return (
                    <tr key={registration.id} className="hover:bg-surface-muted/30">
                      <td className="px-5 py-3">
                        <span className="block font-semibold text-foreground">{registration.applicantName}</span>
                        <span className="text-muted">{registration.email}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{event?.title ?? t("registrations.eventFallback")}</td>
                      <td className="px-4 py-3 text-muted">{registration.registeredAt}</td>
                      <td className="px-4 py-3"><RegistrationStatusBadge status={registration.status} /></td>
                      <td className="px-5 py-3 text-end">
                        {event && (
                          <Link
                            href={`/dashboard/pr-dashboard/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-semibold text-foreground hover:bg-surface-muted"
                          >
                            <Eye className="size-3.5" /> {t("registrations.review")}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 p-5">
          <div>
            <h2 className="text-base font-bold text-foreground">{t("registrations.upcomingTitle")}</h2>
            <p className="text-xs text-muted">{t("registrations.upcomingDescription")}</p>
          </div>
          <Link
            href="/dashboard/pr-dashboard/events"
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {t("registrations.viewAllEvents")}
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="p-5 text-sm text-muted">{t("registrations.emptyEvents")}</p>
        ) : (
          <div className="divide-y divide-border/60">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground">{event.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />{event.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{event.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{event.location}</span>
                  </p>
                  <div className="mt-2"><RegistrationCounts eventId={event.id} /></div>
                </div>
                <Link
                  href={`/dashboard/pr-dashboard/events/${event.id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
                >
                  {t("registrations.viewAllRegistrations")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function PREventsList() {
  const { events, canManageEvents, canCreateEvents, addEvent, publishDraft, loadEventDetails, deleteDraft } = useLeaderDashboard();
  const router = useRouter();
  const t = useTranslations("dashboard.leader");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [draftPreview, setDraftPreview] = useState<{ id: string; data: EventPreviewData } | null>(null);
  const publish = (id: string) => {
    setPublishError("");
    publishDraft(id).catch((error: unknown) => {
      setPublishError(error instanceof Error && error.message ? error.message : t("eventManagement.publishFailed"));
    });
  };
  const [draftToDelete, setDraftToDelete] = useState<{ id: string; title: string } | null>(null);
  const removeDraft = (id: string) => {
    setPublishError("");
    deleteDraft(id).catch((error: unknown) => {
      setPublishError(error instanceof Error && error.message ? error.message : t("eventManagement.deleteDraftFailed"));
    });
  };
  const openDraftPreview = (id: string) => {
    setPublishError("");
    loadEventDetails(id)
      .then((details) => setDraftPreview({ id, data: toEventPreviewData(details) }))
      .catch(() => setPublishError(t("eventManagement.previewFailed")));
  };
  const availableEvents = events.filter((event) => event.status !== "Draft");
  const draftEvents = events.filter((event) => event.status === "Draft");
  const filteredEvents = availableEvents.filter((event) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || event.title.toLowerCase().includes(query) || event.location.toLowerCase().includes(query);
    const matchesStatus = filter === "all" || event.status.toLowerCase().replaceAll(" ", "-") === filter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t("registrations.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("registrations.description")}</p>
        </div>
        {(canManageEvents || canCreateEvents) && <button type="button" onClick={() => setCreateEventOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"><Plus className="size-4" />{t("eventForm.create")}</button>}
      </div>

      {draftEvents.length > 0 && <section className="rounded-2xl border border-border bg-surface-muted/40 p-4">
        <div className="flex items-center gap-2"><Sparkles className="size-4 text-blue-500" /><h3 className="text-sm font-bold text-foreground">{t("eventManagement.unpublished", { count: draftEvents.length })}</h3></div>
        <p className="mt-1 text-xs text-muted">{t("eventManagement.draftsDescription")}</p>
        {publishError && <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{publishError}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{draftEvents.map((draft) => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"><div className="min-w-0"><button type="button" onClick={() => openDraftPreview(draft.id)} title={t("eventManagement.previewDraft")} className="block max-w-full truncate text-start text-sm font-semibold text-foreground underline-offset-2 hover:text-blue-600 hover:underline">{draft.title}</button><span className="text-[11px] text-muted">{draft.date} · {draft.location}</span></div><div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={() => setDraftToDelete({ id: draft.id, title: draft.title })} aria-label={t("eventManagement.deleteDraft")} title={t("eventManagement.deleteDraft")} className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><Trash2 className="size-4" /></button><button type="button" onClick={() => publish(draft.id)} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"><Send className="size-3" />{t("eventForm.publish")}</button></div></div>)}</div>
      </section>}

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-2xs sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("registrations.searchEvents")}
            className="h-10 w-full rounded-xl border border-border bg-surface-muted/40 ps-9 pe-3 text-sm text-foreground outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-blue-500"
          aria-label={t("registrations.filterEvents")}
        >
          {prEventStatusFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.value === "all" ? t("registrations.filters.allEvents") : option.value === "upcoming" ? t("registrations.filters.upcoming") : option.value === "completed" ? t("registrations.filters.completed") : t("registrations.filters.needsUpdate")}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="border-b border-border/80 p-5">
          <h3 className="text-base font-bold text-foreground">{t("registrations.tableTitle")}</h3>
          <p className="text-xs text-muted">{t("registrations.permissions")}</p>
        </div>
        {filteredEvents.length === 0 ? (
          <p className="p-5 text-sm text-muted">{t("registrations.emptyFilter")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 text-start">{t("registrations.event")}</th>
                  <th className="px-4 py-3.5 text-start">{t("registrations.date")}</th>
                  <th className="px-4 py-3.5 text-start">{t("registrations.location")}</th>
                  <th className="px-4 py-3.5 text-start">{t("registrations.registrationStatus")}</th>
                  <th className="px-4 py-3.5 text-start">{t("registrations.registrations")}</th>
                  <th className="px-5 py-3.5 text-end">{t("registrations.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-surface-muted/30">
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold text-foreground">{event.title}</span>
                      <span className="text-[11px] text-muted">{event.type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground/80">{event.date} · {event.time}</td>
                    <td className="px-4 py-3.5 text-foreground/80">{event.location}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted">
                        {t(`eventFilters.${event.status === "Needs Update" ? "needsUpdate" : event.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><RegistrationCounts eventId={event.id} /></td>
                    <td className="px-5 py-3.5 text-end">
                      <Link
                        href={`/dashboard/pr-dashboard/events/${event.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-semibold text-foreground transition hover:bg-surface-muted"
                      >
                        <ClipboardList className="size-3.5" /> {t("registrations.viewAllRegistrations")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={Boolean(draftToDelete)} onClose={() => setDraftToDelete(null)} onConfirm={() => { if (draftToDelete) removeDraft(draftToDelete.id); }} title={t("eventManagement.deleteDraft")} message={t("eventManagement.deleteDraftConfirm", { title: draftToDelete?.title ?? "" })} confirmText={t("eventManagement.deleteDraft")} cancelText={t("members.cancel")} danger />
      {draftPreview && <EventPreviewModal data={draftPreview.data} editLabel={t("eventManagement.closePreview")} onEdit={() => setDraftPreview(null)} onPublish={() => { const id = draftPreview.id; setDraftPreview(null); publish(id); }} />}
      <CreateEventModal isOpen={createEventOpen} onClose={() => setCreateEventOpen(false)} onCreate={addEvent} onViewEvent={(eventId) => { setCreateEventOpen(false); router.push(`/dashboard/pr-dashboard/events/${eventId}`); }} />
    </div>
  );
}

export function PREventRegistrations({ eventId }: { eventId: string }) {
  const { events, registrations, updateRegistrationStatus, canManageRegistrations, registrationError, clearRegistrationError, reloadRegistrations } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [decisionRegistration, setDecisionRegistration] = useState<EventRegistration | null>(null);
  const [decision, setDecision] = useState<RegistrationStatus | null>(null);

  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (!active || refreshing || document.visibilityState !== "visible") return;
      refreshing = true;
      try {
        await reloadRegistrations(eventId);
      } finally {
        refreshing = false;
      }
    };
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 10_000);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, [eventId, reloadRegistrations]);

  const event = events.find((item) => item.id === eventId && item.status !== "Draft");
  const eventRegistrations = registrations.filter((item) => item.eventId === eventId);
  const query = search.trim().toLowerCase();
  const filteredRegistrations = eventRegistrations.filter((registration) => {
    const matchesSearch = !query || registration.applicantName.toLowerCase().includes(query) || registration.email.toLowerCase().includes(query);
    const awaitingConfirmation = registration.status === "Accepted" &&
      (registration.confirmationStatus === "NotSent" || registration.confirmationStatus === "Pending");
    const matchesStatus = statusFilter === "all" || registration.status.toLowerCase() === statusFilter ||
      (statusFilter === "awaiting-confirmation" && awaitingConfirmation);
    return matchesSearch && matchesStatus;
  });

  if (!event) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-semibold text-foreground">{t("registrations.notFound")}</p>
        <Link href="/dashboard/pr-dashboard/events" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft className="size-4" /> {t("registrations.backToEvents")}
        </Link>
      </div>
    );
  }

  const countByStatus = (status: RegistrationStatus) => eventRegistrations.filter((item) => item.status === status).length;
  const awaitingConfirmationCount = eventRegistrations.filter(
    (item) => item.status === "Accepted" &&
      (item.confirmationStatus === "NotSent" || item.confirmationStatus === "Pending")
  ).length;
  const requestDecision = (registration: EventRegistration, nextDecision: RegistrationStatus) => {
    setDecisionRegistration(registration);
    setDecision(nextDecision);
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/pr-dashboard/events" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("registrations.title")}
      </Link>

      {registrationError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-gdg-red/40 bg-gdg-red/5 px-4 py-3 text-sm text-gdg-red">
          <span>{registrationError}</span>
          <button type="button" onClick={clearRegistrationError} aria-label={t("registrations.cancel")} className="font-semibold">×</button>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-2xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">{event.title}</h2>
            <p className="mt-2 text-sm text-muted">{event.description || t("registrations.noDescription")}</p>
          </div>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">{t("registrations.statusUnavailable")}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Calendar className="size-4" />{event.date}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{event.time}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{event.location}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: t("registrations.totalLabel"), value: eventRegistrations.length, icon: Users },
            { label: t("registrations.pendingLabel"), value: countByStatus("Pending"), icon: ClipboardList },
            { label: t("registrations.acceptedLabel"), value: countByStatus("Accepted"), icon: CircleCheck },
            { label: t("registrations.rejectedLabel"), value: countByStatus("Rejected"), icon: CircleX },
            { label: t("registrations.waitlistLabel"), value: countByStatus("Waitlisted"), icon: ClipboardList },
            { label: t("registrations.confirmationOutstanding"), value: awaitingConfirmationCount, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border bg-surface-muted/40 p-3">
              <div className="flex items-center gap-2 text-muted"><Icon className="size-4" /><span className="text-xs">{label}</span></div>
              <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <PRAttendancePanel event={event} registrations={eventRegistrations} />

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-border/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">{t("registrations.applicants")}</h3>
            <p className="text-xs text-muted">{t("registrations.reviewDescription")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("registrations.searchApplicant")}
                className="h-9 w-full rounded-xl border border-border bg-surface-muted/40 ps-9 pe-3 text-xs text-foreground outline-none focus:border-blue-500 sm:w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t("registrations.filterRegistrations")}
              className="h-9 rounded-xl border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-blue-500"
            >
              {prRegistrationStatusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.value === "all" ? t("registrations.filters.allStatuses") : option.value === "pending" ? t("registrations.statuses.pending") : option.value === "accepted" ? t("registrations.statuses.accepted") : option.value === "rejected" ? t("registrations.statuses.rejected") : option.value === "waitlisted" ? t("registrations.statuses.waitlisted") : t("registrations.filters.confirmationOutstanding")}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="mx-auto size-8 text-muted" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              {eventRegistrations.length === 0 ? t("registrations.noRegistrations") : t("registrations.noMatchingRegistrations")}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t("registrations.recordsNotice")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 text-start">{t("registrations.applicant")}</th>
                  <th className="px-4 py-3.5 text-start">{t("registrations.registrationDate")}</th>
                  <th className="px-4 py-3.5 text-start">{t("registrations.status")}</th>
                  <th className="px-5 py-3.5 text-end">{t("registrations.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-surface-muted/30">
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold text-foreground">{registration.applicantName}</span>
                      <span className="text-muted">{registration.email}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{registration.registeredAt}</td>
                    <td className="px-4 py-3.5">
                      <RegistrationStatusBadge
                        status={registration.status}
                        confirmationStatus={registration.confirmationStatus}
                        waitlistPosition={registration.waitlistPosition}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        {registration.status === "Pending" && canManageRegistrations && (
                          <>
                            <button type="button" onClick={() => requestDecision(registration, "Accepted")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
                              <CircleCheck className="size-3.5" /> {t("registrations.accept")}
                            </button>
                            <button type="button" onClick={() => requestDecision(registration, "Rejected")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-semibold text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40">
                              <CircleX className="size-3.5" /> {t("registrations.reject")}
                            </button>
                            <button type="button" onClick={() => requestDecision(registration, "Waitlisted")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40">
                              <ListPlus className="size-3.5" /> {t("registrations.waitlist")}
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => setSelectedRegistration(registration)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-semibold text-foreground hover:bg-surface-muted">
                          <Eye className="size-3.5" /> {t("registrations.review")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label={t("registrations.closeApplicant")} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedRegistration(null)} />
          <section className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedRegistration.applicantName}</h3>
                <p className="mt-1 text-xs text-muted">{selectedRegistration.email} · {t("registrations.registeredAt")} {selectedRegistration.registeredAt}</p>
              </div>
              <RegistrationStatusBadge
                status={selectedRegistration.status}
                confirmationStatus={selectedRegistration.confirmationStatus}
                waitlistPosition={selectedRegistration.waitlistPosition}
              />
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-foreground">{t("registrations.applicantInfo")}</h4>
              {Object.keys(selectedRegistration.profile).length === 0 ? (
                <p className="mt-2 text-xs text-muted">{t("registrations.emptyProfile")}</p>
              ) : (
                <dl className="mt-2 grid gap-3 sm:grid-cols-2">
                  {Object.entries(selectedRegistration.profile).map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-surface-muted/30 p-3">
                      <dt className="text-[11px] text-muted">{label}</dt>
                      <dd className="mt-1 text-xs font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {selectedRegistration.status === "Accepted" && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-200">
                <p className="font-semibold">{t("registrations.confirmation", { status: selectedRegistration.confirmationStatus === "Confirmed" ? t("registrations.statuses.confirmed") : selectedRegistration.confirmationStatus === "Pending" ? t("registrations.statuses.awaitingConfirmation") : selectedRegistration.confirmationStatus === "Declined" ? t("registrations.statuses.confirmationDeclined") : selectedRegistration.confirmationStatus === "Expired" ? t("registrations.statuses.confirmationExpired") : t("registrations.statuses.confirmationNeeded") })}</p>
                <p className="mt-1">{t("registrations.emailNotice")}</p>
              </div>
            )}
            {selectedRegistration.status === "Accepted" &&
              (selectedRegistration.confirmationStatus === "Declined" || selectedRegistration.confirmationStatus === "Expired") && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
                  {t("registrations.automaticPromotionNotice")}
                </div>
              )}

            <div className="mt-5 border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground">{t("registrations.questionsAnswers")}</h4>
              {selectedRegistration.answers.length === 0 ? (
                <p className="mt-2 text-xs text-muted">{t("registrations.emptyAnswers")}</p>
              ) : (
                <dl className="mt-2 space-y-3">
                  {selectedRegistration.answers.map((answer) => (
                    <div key={answer.questionId} className="rounded-xl border border-border bg-surface-muted/30 p-3">
                      <dt className="text-xs font-semibold text-foreground">{answer.question}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted">{answer.answer}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              {selectedRegistration.status === "Accepted" && canManageRegistrations && (
                <button type="button" disabled className="cursor-not-allowed rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted opacity-70" title={t("registrations.sendConfirmationTitle")}>
                  {t("registrations.sendConfirmationUnavailable")}
                </button>
              )}
              <button type="button" onClick={() => setSelectedRegistration(null)} className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-muted">{t("registrations.close")}</button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(decision && decisionRegistration)}
        onClose={() => { setDecision(null); setDecisionRegistration(null); }}
        onConfirm={() => {
          if (decision && decisionRegistration) {
            updateRegistrationStatus(decisionRegistration.id, decision);
            setDecisionRegistration(null);
          }
        }}
        title={decision === "Accepted" ? t("registrations.acceptRegistration") : decision === "Waitlisted" ? t("registrations.waitlist") : t("registrations.rejectRegistration")}
        message={decision === "Waitlisted"
          ? <>{t("registrations.placeWaitlist", { name: decisionRegistration?.applicantName ?? "" })}</>
          : <>{t("registrations.confirmDecision", { decision: decision === "Accepted" ? t("registrations.statuses.accepted") : t("registrations.statuses.rejected"), name: decisionRegistration?.applicantName ?? "" })}</>}
        confirmText={decision === "Waitlisted" ? t("registrations.waitlist") : decision === "Accepted" ? t("registrations.accept") : decision === "Rejected" ? t("registrations.reject") : t("registrations.confirm")}
        cancelText={t("registrations.cancel")}
        danger={decision === "Rejected"}
      />
    </div>
  );
}
