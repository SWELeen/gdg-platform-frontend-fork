"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";
import type { CommitteeEvent, EventStatus, EventType } from "../shared/types";
import { X, Calendar, MapPin, Clock, Users, Plus, Trash2 } from "lucide-react";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CommitteeEvent | null;
  onSave?: (updates: Partial<CommitteeEvent>) => Promise<void>;
  hideStatus?: boolean;
  showDraftDetails?: boolean;
}

interface EditEventFormProps {
  event: CommitteeEvent;
  onClose: () => void;
  onSave?: (updates: Partial<CommitteeEvent>) => Promise<void>;
  hideStatus: boolean;
  showDraftDetails: boolean;
}

function EditEventForm({ event, onClose, onSave, hideStatus, showDraftDetails }: EditEventFormProps) {
  const t = useTranslations("dashboard.leader");
  const { updateEvent, canManageEvents } = useLeaderDashboard();

  const [title, setTitle] = useState(event.title);
  const [type, setType] = useState<EventType>(event.type);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [location, setLocation] = useState(event.location);
  const [capacity, setCapacity] = useState<number | string>(event.capacity);
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [description, setDescription] = useState(event.description ?? "");
  const [registrationDeadline, setRegistrationDeadline] = useState(event.registrationDeadline ?? "");
  const [speakers, setSpeakers] = useState(event.speakers ?? "");
  const [mapsLink, setMapsLink] = useState(event.mapsLink ?? "");
  const [requirements, setRequirements] = useState(event.requirements ?? "");
  const [imageUrl, setImageUrl] = useState(event.imageUrl ?? "");
  const [questions, setQuestions] = useState(event.registrationQuestions ?? []);

  const [touched, setTouched] = useState<{
    title?: boolean;
    location?: boolean;
    capacity?: boolean;
    date?: boolean;
    time?: boolean;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);

  const validateTitle = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("eventForm.errors.eventTitleRequired");
    if (trimmed.length < 3) return t("eventForm.errors.titleMin");
    if (trimmed.length > 150) return t("eventForm.errors.titleMax");
    return "";
  };

  const validateLocation = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("eventForm.errors.locationRequired");
    if (trimmed.length < 3) return t("eventForm.errors.locationMin");
    if (trimmed.length > 120) return t("eventForm.errors.locationMax");
    return "";
  };

  const validateCapacity = (val: number | string) => {
    if (val === "" || val === undefined || isNaN(Number(val))) {
      return t("eventForm.errors.capacityNumber");
    }
    const num = Number(val);
    if (!Number.isInteger(num)) return t("eventForm.errors.capacityInteger");
    if (num < 1) return t("eventForm.errors.capacityMin");
    if (num > 5000) return t("eventForm.errors.capacityMax");
    if (num < event.registered) {
      return t("eventForm.errors.capacityBelowRegistrations", { count: event.registered });
    }
    return "";
  };

  const validateDate = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("eventForm.errors.dateRequired");
    if (trimmed.length < 4) return t("eventForm.errors.dateFormat");
    return "";
  };

  const validateTime = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return t("eventForm.errors.timeRequired");
    return "";
  };

  const titleError = touched.title ? validateTitle(title) : "";
  const locationError = touched.location ? validateLocation(location) : "";
  const capacityError = touched.capacity ? validateCapacity(capacity) : "";
  const dateError = touched.date ? validateDate(date) : "";
  const timeError = touched.time ? validateTime(time) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      title: true,
      location: true,
      capacity: true,
      date: true,
      time: true,
    });

    const tErr = validateTitle(title);
    const lErr = validateLocation(location);
    const cErr = validateCapacity(capacity);
    const dErr = validateDate(date);
    const tmErr = validateTime(time);

    if (tErr || lErr || cErr || dErr || tmErr) {
      setGeneralError(t("eventForm.errors.fixErrors"));
      return;
    }

    const updates: Partial<CommitteeEvent> = {
      title: title.trim(),
      type,
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      status,
      description: description.trim(),
      ...(showDraftDetails ? {
        registrationDeadline,
        speakers: speakers.trim(),
        mapsLink: mapsLink.trim(),
        requirements: requirements.trim(),
        imageUrl: imageUrl.trim(),
        registrationQuestions: questions,
      } : {}),
      isDraft: status === "Draft",
    };
    setSaving(true);
    setGeneralError("");
    try {
      if (onSave) await onSave(updates);
      else updateEvent(event.id, updates);
      onClose();
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : t("eventManagement.editFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {t("eventForm.edit")}
          </h2>
          <p className="text-xs text-muted">
            {t("eventForm.description")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {generalError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-50/20 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            {generalError}
          </div>
        )}

        {/* Title */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.title")}
            </label>
            <span className="text-[10px] text-muted">
              {title.length}/150
            </span>
          </div>
          <input
            type="text"
            value={title}
            maxLength={150}
            onChange={(e) => {
              setTitle(e.target.value);
              if (generalError) setGeneralError("");
            }}
            onBlur={() => setTouched((p) => ({ ...p, title: true }))}
            className={`mt-1 h-10 w-full rounded-xl border px-3 text-sm text-foreground outline-none transition ${
              titleError
                ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                : "border-border bg-surface-muted/30 focus:border-blue-500"
            }`}
          />
          {titleError && (
            <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {titleError}
            </p>
          )}
        </div>

        {/* Type & Status */}
        <div className={`grid gap-4 ${hideStatus ? "grid-cols-1" : "grid-cols-2"}`}>
          <div>
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.type")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500"
            >
              <option value="Workshop">{t("eventForm.types.workshop")}</option>
              <option value="Conference">{t("eventForm.types.conference")}</option>
              <option value="Talk">{t("eventForm.types.talk")}</option>
              <option value="Panel">{t("eventForm.types.panel")}</option>
              <option value="Hackathon">{t("eventForm.types.hackathon")}</option>
              <option value="Trip">{t("eventForm.types.trip")}</option>
            </select>
          </div>
          {!hideStatus && <div>
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.status")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500"
            >
              <option value="Upcoming">{t("eventForm.statuses.upcoming")}</option>
              <option value="Completed">{t("eventForm.statuses.completed")}</option>
              <option value="Needs Update">{t("eventForm.statuses.needsUpdate")}</option>
              <option value="Draft">{t("eventForm.statuses.draft")}</option>
            </select>
          </div>}
        </div>

        {/* Date, Time & Capacity */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.date")}
            </label>
            <div className="relative mt-1">
              <Calendar className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={date}
                maxLength={40}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (generalError) setGeneralError("");
                }}
                onBlur={() => setTouched((p) => ({ ...p, date: true }))}
                className={`h-10 w-full rounded-xl border ps-8 pe-2 text-xs text-foreground outline-none transition ${
                  dateError
                    ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                    : "border-border bg-surface-muted/30 focus:border-blue-500"
                }`}
              />
            </div>
            {dateError && (
              <p className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                {dateError}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.time")}
            </label>
            <div className="relative mt-1">
              <Clock className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={time}
                maxLength={30}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (generalError) setGeneralError("");
                }}
                onBlur={() => setTouched((p) => ({ ...p, time: true }))}
                className={`h-10 w-full rounded-xl border ps-8 pe-2 text-xs text-foreground outline-none transition ${
                  timeError
                    ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                    : "border-border bg-surface-muted/30 focus:border-blue-500"
                }`}
              />
            </div>
            {timeError && (
              <p className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                {timeError}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.capacity")}
            </label>
            <div className="relative mt-1">
              <Users className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="number"
                min="1"
                max="5000"
                value={capacity}
                onChange={(e) => {
                  setCapacity(e.target.value === "" ? "" : Number(e.target.value));
                  if (generalError) setGeneralError("");
                }}
                onBlur={() => setTouched((p) => ({ ...p, capacity: true }))}
                className={`h-10 w-full rounded-xl border ps-8 pe-2 text-xs text-foreground outline-none transition ${
                  capacityError
                    ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                    : "border-border bg-surface-muted/30 focus:border-blue-500"
                }`}
              />
            </div>
            {capacityError && (
              <p className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                {capacityError}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.location")}
            </label>
            <span className="text-[10px] text-muted">
              {location.length}/120
            </span>
          </div>
          <div className="relative mt-1">
            <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={location}
              maxLength={120}
              onChange={(e) => {
                setLocation(e.target.value);
                if (generalError) setGeneralError("");
              }}
              onBlur={() => setTouched((p) => ({ ...p, location: true }))}
              className={`h-10 w-full rounded-xl border ps-9 pe-3 text-sm text-foreground outline-none transition ${
                locationError
                  ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-600"
                  : "border-border bg-surface-muted/30 focus:border-blue-500"
              }`}
            />
          </div>
          {locationError && (
            <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {locationError}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground">
              {t("eventForm.optionalDescription")}
            </label>
            <span className="text-[10px] text-muted">
              {description.length}/1000
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface-muted/30 p-3 text-sm text-foreground outline-none focus:border-blue-500"
          />
        </div>

        {showDraftDetails && <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">{t("eventForm.deadline")}</label>
              <input type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">{t("eventForm.speakers")}</label>
              <input type="text" value={speakers} maxLength={2000} onChange={(e) => setSpeakers(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">{t("eventForm.mapsLink")}</label>
            <input type="url" dir="ltr" value={mapsLink} maxLength={500} onChange={(e) => setMapsLink(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">{t("eventForm.requirements")}</label>
            <textarea rows={3} value={requirements} maxLength={5000} onChange={(e) => setRequirements(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-surface-muted/30 p-3 text-sm text-foreground outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">{t("eventForm.imageUrl")}</label>
            <input type="url" dir="ltr" value={imageUrl} maxLength={2000} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" />
          </div>
          <section className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-foreground">{t("eventForm.registrationQuestions")}</h3>
              <button type="button" onClick={() => setQuestions((current) => [...current, { id: `draft-question-${Date.now()}`, type: "short-answer", text: "", required: false }])} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted"><Plus className="size-3.5" />{t("eventForm.addQuestion")}</button>
            </div>
            {questions.length === 0 && <p className="text-xs text-muted">{t("eventForm.noQuestions")}</p>}
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2 rounded-xl border border-border p-3">
                <div className="flex gap-2">
                  <input value={question.text} maxLength={500} aria-label={t("eventForm.questionText", { number: index + 1 })} onChange={(e) => setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, text: e.target.value } : item))} className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface-muted/30 px-3 text-sm text-foreground outline-none focus:border-blue-500" />
                  <button type="button" onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))} aria-label={t("eventForm.removeQuestion", { number: index + 1 })} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><Trash2 className="size-4" /></button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select value={question.type} onChange={(e) => setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, type: e.target.value } : item))} className="h-9 rounded-lg border border-border bg-surface-muted/30 px-2 text-xs text-foreground">
                    <option value="short-answer">{t("eventForm.questionTypes.shortAnswer")}</option>
                    <option value="long-answer">{t("eventForm.questionTypes.longAnswer")}</option>
                    <option value="single-choice">{t("eventForm.questionTypes.singleChoice")}</option>
                    <option value="multiple-choice">{t("eventForm.questionTypes.multipleChoice")}</option>
                    <option value="checkboxes">{t("eventForm.questionTypes.checkboxes")}</option>
                    <option value="yes-no">{t("eventForm.questionTypes.yesNo")}</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs text-foreground"><input type="checkbox" checked={question.required} onChange={(e) => setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, required: e.target.checked } : item))} />{t("eventForm.questionRequired")}</label>
                </div>
                {["single-choice", "multiple-choice", "checkboxes"].includes(question.type) && <input value={(question.options ?? []).join(", ")} aria-label={t("eventForm.questionOptions", { number: index + 1 })} onChange={(e) => setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, options: e.target.value.split(",").map((option) => option.trim()).filter(Boolean) } : item))} placeholder={t("eventForm.optionsPlaceholder")} className="h-9 w-full rounded-lg border border-border bg-surface-muted/30 px-3 text-xs text-foreground outline-none focus:border-blue-500" />}
              </div>
            ))}
          </section>
        </>}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-muted transition"
        >
          {t("eventForm.cancel")}
        </button>
        <button
          type="submit"
          disabled={!canManageEvents || saving}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
        >
          {saving ? t("eventForm.saving") : t("eventForm.saveChanges")}
        </button>
      </div>
    </form>
  );
}

export function EditEventModal({ isOpen, onClose, event, onSave, hideStatus = false, showDraftDetails = false }: EditEventModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <EditEventForm key={event.id} event={event} onClose={onClose} onSave={onSave} hideStatus={hideStatus} showDraftDetails={showDraftDetails} />
      </div>
    </div>
  );
}
