"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

import { useLeaderDashboard } from "@/components/dashboard/shared/LeaderDashboardContext";
import { useTranslations } from "next-intl";
import { EventsFilterBar } from "@/components/dashboard/data-analysis/EventsFilterBar";
import { EventManagementTable } from "@/components/dashboard/data-analysis/EventManagementTable";
import { CreateEventModal } from "@/components/dashboard/data-analysis/CreateEventForm";
import { Plus, Sparkles, Send } from "lucide-react";

export default function LeaderEventsPage() {
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const t = useTranslations("dashboard.leader");
  const { events, publishDraft, canManageEvents, addEvent } = useLeaderDashboard();
  const router = useRouter();

  const draftEvents = events.filter((e) => e.isDraft);

  return (
    <>
    <div className="space-y-6">
      {/* Top Banner & Quick Create */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {t("eventManagement.pageTitle")}
          </h2>
        </div>

        {canManageEvents && (
          <button
            type="button"
            onClick={() => setCreateEventOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="size-4" />
            <span>{t("eventForm.create")}</span>
          </button>
        )}
      </div>

      {/* Draft Events Highlight Card */}
      {draftEvents.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface-muted/40 p-4 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="size-4 text-blue-500" />
            <h3 className="font-bold text-sm">
              {t("eventManagement.unpublished", { count: draftEvents.length })}
            </h3>
          </div>
          <p className="mt-1 text-muted">
            {t("eventManagement.draftsDescription")}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {draftEvents.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
              >
                <div>
                  <span className="font-bold text-foreground block">
                    {draft.title}
                  </span>
                  <span className="text-[11px] text-muted">
                    {draft.date} · {draft.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canManageEvents && (
                    <button
                      type="button"
                      onClick={() => publishDraft(draft.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      <Send className="size-3" />
                      <span>{t("eventForm.publish")}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <EventsFilterBar />

      {/* Event Management Table */}
      <EventManagementTable />
    </div>
    <CreateEventModal
      isOpen={createEventOpen}
      onClose={() => setCreateEventOpen(false)}
      onCreate={addEvent}
      onViewEvent={(eventId) => {
        setCreateEventOpen(false);
        router.push(`/dashboard/data-dashboard/events/${eventId}`);
      }}
    />
    </>
  );
}
