"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  Link2,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { CommitteeEvent, EventType } from "../shared/types";
import { ConfirmModal } from "../shared/ConfirmModal";
import { useDialog } from "../shared/useDialog";
import { formatEventDate, formatEventTime, toIsoDate } from "@/lib/dashboard/event-format";
import { API_ENABLED } from "@/lib/api/client";
import type { EventSchedule } from "@/lib/committee-dashboard/api";
import { EventPreviewModal } from "./EventPreviewModal";
import { EventPublishedModal } from "./EventPublishedModal";
import {
  choiceQuestionTypes,
  questionTypeKeys,
  questionTypes,
  accountRegistrantFields,
  requiredRegistrantFields,
  type DraftQuestion,
} from "./event-form-config";

const styles = {
  overlay: "fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-slate-900/65 p-3 backdrop-blur-sm sm:items-center sm:p-6",
  page: "min-h-screen w-full bg-surface-muted px-3 py-5 md:px-6 md:py-10",
  card: "relative mx-auto w-full max-w-[900px] overflow-hidden rounded-[14px] bg-surface text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.08)] outline-none",
  modalCard: "max-h-[calc(100vh-1.5rem)] overflow-y-auto sm:max-h-[calc(100vh-3rem)]",
  header: "relative bg-gradient-to-br from-[#4285f4] via-[#ea4335] to-[#fbbc04] px-6 py-5 pe-16 text-white sm:px-10",
  close: "absolute end-4 top-4 z-[1] grid size-9 place-items-center rounded-[10px] bg-white/90 text-gray-700 transition hover:bg-white",
  body: "px-5 py-6 sm:px-10 sm:py-8",
  sectionTitle: "mb-4 text-lg font-bold text-foreground sm:text-xl",
  colorGroup: "mb-7 border-s-4 ps-4",
  row: "grid grid-cols-1 gap-x-6 md:grid-cols-2",
  field: "mb-5 flex min-w-0 flex-col gap-1.5",
  label: "text-sm font-semibold text-foreground/85",
  input: "box-border min-h-[44px] w-full rounded-[10px] border bg-surface px-3.5 py-2.5 text-sm text-foreground transition placeholder:text-muted focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-surface-muted/60",
  inputOk: "border-border focus:border-gdg-blue focus:ring-gdg-blue/15",
  inputError: "border-red-500 focus:border-red-500 focus:ring-red-500/15",
  error: "text-xs font-medium text-red-600 dark:text-red-400",
  iconInput: "pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted",
  outlineButton: "min-w-[120px] rounded-[10px] border px-5 py-2.5 text-sm font-semibold transition max-sm:w-full",
  primaryButton: "min-w-[120px] rounded-[10px] bg-gdg-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gdg-blue/90 max-sm:w-full",
} as const;

type CreateEventInput = Omit<CommitteeEvent, "id" | "created" | "updated">;

type FieldName =
  | "title"
  | "description"
  | "date"
  | "time"
  | "location"
  | "mapsLink"
  | "capacity"
  | "registrationDeadline"
  | "image";

// Validation order = visual order, so the first error is also the first field focused.
const fieldOrder: FieldName[] = [
  "title",
  "description",
  "date",
  "time",
  "location",
  "mapsLink",
  "capacity",
  "registrationDeadline",
  "image",
];

const eventTypes: EventType[] = ["Workshop", "Conference", "Talk", "Panel", "Hackathon"];

interface FormValues {
  title: string;
  type: EventType;
  description: string;
  speakers: string;
  date: string;
  time: string;
  location: string;
  mapsLink: string;
  capacity: string;
  registrationDeadline: string;
  requirements: string;
}

const emptyValues: FormValues = {
  title: "",
  type: "Workshop",
  description: "",
  speakers: "",
  date: "",
  time: "",
  location: "",
  mapsLink: "",
  capacity: "",
  registrationDeadline: "",
  requirements: "",
};

const fieldId = (name: string) => `create-event-${name}`;

interface CreateEventFormProps {
  isModal?: boolean;
  onClose?: () => void;
  /** Adds the event; returning its id enables the "View Event" action. A rejected promise shows its message. */
  onCreate?: CreateEventHandler;
  onViewEvent?: (eventId: string) => void;
}

type CreateEventHandler = (event: CreateEventInput, schedule: EventSchedule) => string | void | Promise<string | void>;

// The form has no end time yet, so events last two hours.
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

/** Local date and time inputs → the exact instants the backend stores. Registration closes at the end of the chosen day, never after the start. */
function toSchedule(values: FormValues): EventSchedule {
  const startsAt = new Date(`${values.date}T${values.time}`);
  const deadlineEnd = new Date(`${values.registrationDeadline}T23:59:59`);
  return {
    startsAt: startsAt.toISOString(),
    endsAt: new Date(startsAt.getTime() + DEFAULT_DURATION_MS).toISOString(),
    registrationDeadline: new Date(Math.min(deadlineEnd.getTime(), startsAt.getTime())).toISOString(),
  };
}

export function CreateEventModal({
  isOpen,
  onClose,
  onCreate,
  onViewEvent,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: CreateEventHandler;
  onViewEvent?: (eventId: string) => void;
}) {
  if (!isOpen) return null;
  return <CreateEventForm isModal onClose={onClose} onCreate={onCreate} onViewEvent={onViewEvent} />;
}

function Field({
  name,
  label,
  required,
  optional,
  error,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  optional?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId(name)} className={styles.label}>
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}*
          </span>
        )}
        {optional && <span className="ms-1 text-xs font-normal text-muted">{optional}</span>}
      </label>
      {children}
      {error && (
        <p id={`${fieldId(name)}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function CreateEventForm({ isModal = false, onClose, onCreate, onViewEvent }: CreateEventFormProps) {
  const t = useTranslations("dashboard.leader.createEvent");
  const tf = useTranslations("dashboard.leader.eventForm");

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<string[]>(["", ""]);
  const [questionRequired, setQuestionRequired] = useState(true);
  const [draggedQuestion, setDraggedQuestion] = useState<number | null>(null);
  const [questionError, setQuestionError] = useState("");

  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [publishedEvent, setPublishedEvent] = useState<{ id: string | null; title: string } | null>(null);
  const [publishStatus, setPublishStatus] = useState<"publish" | "draft">("publish");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [today] = useState(() => toIsoDate(new Date()));

  // The selected image's blob URL is revoked when replaced or when the form unmounts,
  // except after publishing, when the stored event keeps using it for this session.
  const imageUrlRef = useRef<string | null>(null);
  const handedOffImageUrlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      const url = imageUrlRef.current;
      if (url && url !== handedOffImageUrlRef.current) URL.revokeObjectURL(url);
    };
  }, []);

  const isDirty =
    questions.length > 0 ||
    image !== null ||
    (Object.keys(emptyValues) as (keyof FormValues)[]).some((key) => values[key] !== emptyValues[key]);

  const requestClose = () => {
    if (publishedEvent) {
      onClose?.();
    } else if (isDirty) {
      setConfirmDiscard(true);
    } else {
      onClose?.();
    }
  };

  // Escape on the form: close the discard prompt if it is open, otherwise ask before
  // discarding. Nested preview/success dialogs register above this one and win.
  const dialogRef = useDialog<HTMLElement>(() => {
    if (confirmDiscard) setConfirmDiscard(false);
    else requestClose();
  }, isModal);

  const validate = (current: FormValues, currentImage: typeof image) => {
    const next: Partial<Record<FieldName, string>> = {};
    const title = current.title.trim();
    if (!title) next.title = tf("errors.eventTitleRequired");
    else if (title.length < 3) next.title = tf("errors.titleMin");
    else if (title.length > 150) next.title = tf("errors.titleMax");

    if (!current.description.trim()) next.description = t("errors.descriptionRequired");

    if (!current.date) next.date = tf("errors.dateRequired");
    else if (current.date < today) next.date = t("errors.datePast");

    if (!current.time) next.time = tf("errors.timeRequired");

    const location = current.location.trim();
    if (!location) next.location = tf("errors.locationRequired");
    else if (location.length < 3) next.location = tf("errors.locationMin");
    else if (location.length > 120) next.location = tf("errors.locationMax");

    const mapsLink = current.mapsLink.trim();
    if (mapsLink) {
      let valid = false;
      try {
        const url = new URL(mapsLink);
        valid = url.protocol === "http:" || url.protocol === "https:";
      } catch {
        valid = false;
      }
      if (!valid) next.mapsLink = t("errors.mapsLinkInvalid");
    }

    if (!current.capacity.trim()) next.capacity = t("errors.capacityRequired");
    else {
      const capacity = Number(current.capacity);
      if (!Number.isFinite(capacity)) next.capacity = tf("errors.capacityNumber");
      else if (!Number.isInteger(capacity)) next.capacity = tf("errors.capacityInteger");
      else if (capacity < 1) next.capacity = tf("errors.capacityMin");
      else if (capacity > 5000) next.capacity = tf("errors.capacityMax");
    }

    if (!current.registrationDeadline) next.registrationDeadline = t("errors.deadlineRequired");
    else if (current.registrationDeadline < today) next.registrationDeadline = t("errors.deadlinePast");
    else if (current.date && current.registrationDeadline > current.date) {
      next.registrationDeadline = t("errors.deadlineAfterEvent");
    }

    // Images are not uploaded to the backend yet, so they are optional there.
    if (!currentImage && !API_ENABLED) next.image = t("errors.imageRequired");
    return next;
  };

  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    // After the first submit attempt, errors update live as fields are corrected.
    if (submitAttempted) setErrors(validate(nextValues, image));
  };

  const selectImage = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: t("errors.imageType") }));
      return;
    }
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;
    const nextImage = { file, url };
    setImage(nextImage);
    setErrors((current) => (submitAttempted ? validate(values, nextImage) : { ...current, image: undefined }));
  };

  const removeImage = () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setImage(null);
    if (submitAttempted) setErrors(validate(values, null));
  };

  const validateAndFocus = () => {
    setSubmitAttempted(true);
    const nextErrors = validate(values, image);
    setErrors(nextErrors);
    const firstInvalid = fieldOrder.find((name) => nextErrors[name]);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return false;
    }
    return true;
  };

  const resetQuestionForm = () => {
    setQuestionType("");
    setQuestionText("");
    setQuestionOptions(["", ""]);
    setQuestionRequired(true);
    setQuestionError("");
    setShowQuestionForm(false);
  };

  const setQuestionRequiredAt = (id: string, required: boolean) =>
    setQuestions((current) => current.map((item) => (item.id === id ? { ...item, required } : item)));

  // Moves a question to a new position, by drag and drop or the up/down buttons.
  const moveQuestion = (from: number, to: number) => {
    setQuestions((current) => {
      if (to < 0 || to >= current.length || from === to) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleAddQuestion = () => {
    if (!questionType) {
      setQuestionError(t("questions.errors.type"));
      return;
    }
    if (!questionText.trim()) {
      setQuestionError(t("questions.errors.text"));
      return;
    }

    let options: string[] | undefined;
    if (questionType === "yes-no") {
      options = ["Yes", "No"];
    } else if (choiceQuestionTypes.includes(questionType)) {
      options = questionOptions.map((option) => option.trim()).filter(Boolean);
      if (options.length < 2) {
        setQuestionError(t("questions.errors.options"));
        return;
      }
      if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
        setQuestionError(t("questions.errors.duplicateOptions"));
        return;
      }
    }

    setQuestions((current) => [
      ...current,
      {
        id: `registration-question-${Date.now()}`,
        type: questionType,
        text: questionText.trim(),
        required: questionRequired,
        ...(options ? { options } : {}),
      },
    ]);
    resetQuestionForm();
  };

  const handlePreview = () => {
    if (validateAndFocus()) setShowPreview(true);
  };

  const handlePublish = async () => {
    if (publishedEvent || saving) return;
    if (!validateAndFocus()) {
      setShowPreview(false);
      return;
    }

    const isDraft = publishStatus === "draft";
    const eventData: CreateEventInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      type: values.type,
      date: formatEventDate(values.date),
      time: formatEventTime(values.time),
      location: values.location.trim(),
      speakers: values.speakers.trim(),
      mapsLink: values.mapsLink.trim(),
      capacity: Number(values.capacity),
      registrationDeadline: formatEventDate(values.registrationDeadline),
      requirements: values.requirements.trim(),
      imageUrl: image?.url,
      registered: 0,
      status: isDraft ? "Draft" : "Upcoming",
      isDraft,
      requiredRegistrantFields,
      registrationQuestions: questions,
    };

    setSaving(true);
    setSaveError("");
    try {
      const createdId = await onCreate?.(eventData, toSchedule(values));
      handedOffImageUrlRef.current = image?.url ?? null;
      setShowPreview(false);
      // A draft is not published, so the "published" dialog would be wrong.
      if (isDraft) onClose?.();
      else setPublishedEvent({ id: typeof createdId === "string" ? createdId : null, title: eventData.title });
    } catch (error) {
      setShowPreview(false);
      setSaveError(error instanceof Error && error.message ? error.message : t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (name: FieldName) =>
    `${styles.input} ${errors[name] ? styles.inputError : styles.inputOk}`;

  const describedBy = (name: FieldName) => (errors[name] ? `${fieldId(name)}-error` : undefined);

  const errorCount = fieldOrder.filter((name) => errors[name]).length;

  return (
    <div
      className={isModal ? styles.overlay : styles.page}
      onMouseDown={(event) => {
        if (isModal && event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        ref={dialogRef}
        role={isModal ? "dialog" : undefined}
        aria-modal={isModal ? true : undefined}
        aria-labelledby="create-event-dialog-title"
        tabIndex={isModal ? -1 : undefined}
        className={`${styles.card} ${isModal ? styles.modalCard : ""}`}
      >
        <header className={styles.header}>
          <h1 id="create-event-dialog-title" className="text-2xl font-bold sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-white/90">{t("subtitle")}</p>
          {isModal && (
            <button type="button" className={styles.close} onClick={requestClose} aria-label={t("close")}>
              <X size={20} />
            </button>
          )}
        </header>

        <form
          className={styles.body}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void handlePublish();
          }}
        >
          <h2 className={styles.sectionTitle}>{t("sections.eventInfo")}</h2>

          <div className={`${styles.colorGroup} border-s-gdg-yellow`}>
            <Field name="title" label={t("fields.name")} required error={errors.title}>
              <input
                id={fieldId("title")}
                className={inputClass("title")}
                type="text"
                placeholder={t("placeholders.name")}
                value={values.title}
                maxLength={150}
                aria-required="true"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={describedBy("title")}
                onChange={(event) => setValue("title", event.target.value)}
              />
            </Field>

            <Field name="description" label={t("fields.description")} required error={errors.description}>
              <textarea
                id={fieldId("description")}
                className={`${inputClass("description")} min-h-[110px] resize-y`}
                placeholder={t("placeholders.description")}
                value={values.description}
                aria-required="true"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={describedBy("description")}
                onChange={(event) => setValue("description", event.target.value)}
              />
            </Field>

            <div className={styles.row}>
              <Field name="speakers" label={t("fields.speakers")} optional={t("optional")}>
                <input
                  id={fieldId("speakers")}
                  className={`${styles.input} ${styles.inputOk}`}
                  type="text"
                  placeholder={t("placeholders.speakers")}
                  value={values.speakers}
                  onChange={(event) => setValue("speakers", event.target.value)}
                />
              </Field>

              <Field name="type" label={t("fields.type")} required>
                <select
                  id={fieldId("type")}
                  className={`${styles.input} ${styles.inputOk}`}
                  value={values.type}
                  onChange={(event) => setValue("type", event.target.value as EventType)}
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {tf(`types.${type.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className={`${styles.colorGroup} border-s-gdg-red`}>
            <div className={styles.row}>
              <Field name="date" label={t("fields.date")} required error={errors.date}>
                <input
                  id={fieldId("date")}
                  className={inputClass("date")}
                  type="date"
                  min={today}
                  value={values.date}
                  aria-required="true"
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={describedBy("date")}
                  onChange={(event) => setValue("date", event.target.value)}
                />
              </Field>

              <Field name="time" label={t("fields.time")} required error={errors.time}>
                <input
                  id={fieldId("time")}
                  className={inputClass("time")}
                  type="time"
                  value={values.time}
                  aria-required="true"
                  aria-invalid={Boolean(errors.time)}
                  aria-describedby={describedBy("time")}
                  onChange={(event) => setValue("time", event.target.value)}
                />
              </Field>
            </div>

            <div className={styles.row}>
              <Field name="location" label={t("fields.location")} required error={errors.location}>
                <div className="relative">
                  <MapPin className={styles.iconInput} aria-hidden="true" />
                  <input
                    id={fieldId("location")}
                    className={`${inputClass("location")} ps-9`}
                    type="text"
                    placeholder={t("placeholders.location")}
                    value={values.location}
                    maxLength={120}
                    aria-required="true"
                    aria-invalid={Boolean(errors.location)}
                    aria-describedby={describedBy("location")}
                    onChange={(event) => setValue("location", event.target.value)}
                  />
                </div>
              </Field>

              <Field name="mapsLink" label={t("fields.mapsLink")} optional={t("optional")} error={errors.mapsLink}>
                <div className="relative">
                  <Link2 className={styles.iconInput} aria-hidden="true" />
                  <input
                    id={fieldId("mapsLink")}
                    className={`${inputClass("mapsLink")} ps-9`}
                    type="url"
                    inputMode="url"
                    dir="ltr"
                    placeholder={t("placeholders.mapsLink")}
                    value={values.mapsLink}
                    aria-invalid={Boolean(errors.mapsLink)}
                    aria-describedby={describedBy("mapsLink")}
                    onChange={(event) => setValue("mapsLink", event.target.value)}
                  />
                </div>
              </Field>
            </div>
          </div>

          <div className={`${styles.colorGroup} border-s-gdg-green`}>
            <div className={styles.row}>
              <Field name="capacity" label={t("fields.capacity")} required error={errors.capacity}>
                <input
                  id={fieldId("capacity")}
                  className={inputClass("capacity")}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5000}
                  step={1}
                  placeholder={t("placeholders.capacity")}
                  value={values.capacity}
                  aria-required="true"
                  aria-invalid={Boolean(errors.capacity)}
                  aria-describedby={describedBy("capacity")}
                  onChange={(event) => setValue("capacity", event.target.value)}
                />
              </Field>

              <Field
                name="registrationDeadline"
                label={t("fields.deadline")}
                required
                error={errors.registrationDeadline}
              >
                <input
                  id={fieldId("registrationDeadline")}
                  className={inputClass("registrationDeadline")}
                  type="date"
                  min={today}
                  max={values.date || undefined}
                  value={values.registrationDeadline}
                  aria-required="true"
                  aria-invalid={Boolean(errors.registrationDeadline)}
                  aria-describedby={describedBy("registrationDeadline")}
                  onChange={(event) => setValue("registrationDeadline", event.target.value)}
                />
              </Field>
            </div>

            <Field name="requirements" label={t("fields.requirements")} optional={t("optional")}>
              <textarea
                id={fieldId("requirements")}
                className={`${styles.input} ${styles.inputOk} min-h-[90px] resize-y`}
                placeholder={t("placeholders.requirements")}
                value={values.requirements}
                onChange={(event) => setValue("requirements", event.target.value)}
              />
            </Field>
          </div>

          <div className={`${styles.colorGroup} border-s-gdg-blue`}>
            <div className={styles.field}>
              <span id={`${fieldId("image")}-label`} className={styles.label}>
                {t("fields.image")}
                <span className="text-red-600" aria-hidden="true">
                  {" "}*
                </span>
              </span>

              {image ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-border p-3 sm:flex-row sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL of the selected file; next/image cannot optimize it. */}
                  <img
                    src={image.url}
                    alt={t("upload.previewAlt")}
                    className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{image.file.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <label
                        htmlFor={fieldId("image")}
                        className="cursor-pointer rounded-lg border border-gdg-blue px-3 py-1.5 text-xs font-semibold text-gdg-blue transition hover:bg-gdg-blue/5 focus-within:ring-[3px] focus-within:ring-gdg-blue/20"
                      >
                        {t("upload.replace")}
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        {t("upload.remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor={fieldId("image")}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDraggingImage(false);
                    selectImage(event.dataTransfer.files?.[0]);
                  }}
                  className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition focus-within:ring-[3px] focus-within:ring-gdg-blue/20 ${
                    errors.image
                      ? "border-red-400 bg-red-50/40 dark:bg-red-950/10"
                      : isDraggingImage
                        ? "border-gdg-blue bg-gdg-blue/5"
                        : "border-gdg-blue/40 hover:border-gdg-blue hover:bg-gdg-blue/5"
                  }`}
                >
                  <ImagePlus className="size-8 text-gdg-blue" aria-hidden="true" />
                  <span className="text-sm font-semibold text-foreground">{t("upload.title")}</span>
                  <small className="text-xs text-muted">{t("upload.hint")}</small>
                </label>
              )}

              <input
                id={fieldId("image")}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-labelledby={`${fieldId("image")}-label`}
                aria-required="true"
                aria-invalid={Boolean(errors.image)}
                aria-describedby={describedBy("image")}
                onChange={(event) => {
                  selectImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              {errors.image && (
                <p id={`${fieldId("image")}-error`} className={styles.error}>
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          <h2 className={styles.sectionTitle}>{t("sections.registrationInfo")}</h2>
          <p className="-mt-2 mb-4 text-sm text-muted">{t("registration.description")}</p>

          <ul className="mb-6 flex flex-wrap gap-2" aria-label={t("sections.registrationInfo")}>
            {accountRegistrantFields.map((field) => (
              <li key={field} className="rounded-full border border-border bg-surface-muted/60 px-3 py-1 text-xs text-foreground/80">
                {t(`registration.fields.${field}`)}
              </li>
            ))}
          </ul>

          {questions.length > 0 && (
            <section aria-labelledby="create-event-questions" className="mb-4 flex flex-col gap-3">
              <h3 id="create-event-questions" className="text-base font-bold text-foreground">
                {t("questions.title")}
              </h3>
              <p className="-mt-2 text-sm text-muted">{t("questions.help")}</p>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={(event) => {
                    setDraggedQuestion(index);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => {
                    if (draggedQuestion === null) return;
                    event.preventDefault();
                    if (draggedQuestion !== index) {
                      moveQuestion(draggedQuestion, index);
                      setDraggedQuestion(index);
                    }
                  }}
                  onDragEnd={() => setDraggedQuestion(null)}
                  onDrop={(event) => event.preventDefault()}
                  className={`rounded-xl border bg-surface p-4 transition ${
                    draggedQuestion === index ? "border-gdg-blue opacity-60" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <GripVertical
                        className="mt-0.5 size-4 shrink-0 cursor-grab text-muted active:cursor-grabbing"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-semibold text-foreground">
                        {index + 1}. {question.text}
                        <span
                          className={`ms-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            question.required
                              ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {question.required ? t("questions.requiredBadge") : t("questions.optionalBadge")}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, index - 1)}
                        disabled={index === 0}
                        aria-label={t("questions.moveUp", { number: index + 1 })}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, index + 1)}
                        disabled={index === questions.length - 1}
                        aria-label={t("questions.moveDown", { number: index + 1 })}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}
                        aria-label={t("questions.remove", { number: index + 1 })}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-foreground/80">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(event) => setQuestionRequiredAt(question.id, event.target.checked)}
                      className="size-3.5 accent-gdg-blue"
                    />
                    {t("questions.requiredToggle")}
                  </label>
                  <p className="mt-1 text-xs text-muted">
                    {t(`questions.types.${questionTypeKeys[question.type]}`)}
                  </p>
                  {question.options && (
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80">
                      {question.options.map((option) => (
                        <li key={option}>
                          {question.type === "yes-no"
                            ? t(option === "Yes" ? "questions.yes" : "questions.no")
                            : option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {showQuestionForm ? (
            <div className="mb-4 rounded-2xl border border-border bg-surface-muted/40 p-4 sm:p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">{t("questions.formTitle")}</h3>
              <div className={styles.field}>
                <label htmlFor={fieldId("question-type")} className={styles.label}>
                  {t("questions.type")}
                </label>
                <select
                  id={fieldId("question-type")}
                  className={`${styles.input} ${styles.inputOk}`}
                  value={questionType}
                  onChange={(event) => {
                    setQuestionType(event.target.value);
                    setQuestionError("");
                  }}
                >
                  <option value="">{t("questions.selectType")}</option>
                  {questionTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(`questions.types.${questionTypeKeys[type]}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor={fieldId("question-text")} className={styles.label}>
                  {t("questions.text")}
                </label>
                <input
                  id={fieldId("question-text")}
                  className={`${styles.input} ${styles.inputOk}`}
                  placeholder={t("questions.textPlaceholder")}
                  value={questionText}
                  onChange={(event) => {
                    setQuestionText(event.target.value);
                    setQuestionError("");
                  }}
                />
              </div>

              {choiceQuestionTypes.includes(questionType) && (
                <fieldset className="mb-4 flex flex-col gap-2">
                  <legend className={`${styles.label} mb-2`}>{t("questions.options")}</legend>
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        className={`${styles.input} ${styles.inputOk}`}
                        placeholder={t("questions.optionPlaceholder", { number: index + 1 })}
                        aria-label={t("questions.optionPlaceholder", { number: index + 1 })}
                        value={option}
                        onChange={(event) => {
                          const next = [...questionOptions];
                          next[index] = event.target.value;
                          setQuestionOptions(next);
                          setQuestionError("");
                        }}
                      />
                      {questionOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setQuestionOptions(questionOptions.filter((_, i) => i !== index))}
                          aria-label={t("questions.removeOption", { number: index + 1 })}
                          className="shrink-0 rounded-lg border border-red-300 p-2.5 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuestionOptions([...questionOptions, ""])}
                    className="w-fit rounded-lg border border-gdg-blue px-3.5 py-2 text-xs font-semibold text-gdg-blue transition hover:bg-gdg-blue/5"
                  >
                    {t("questions.addOption")}
                  </button>
                </fieldset>
              )}

              <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={questionRequired}
                  onChange={(event) => setQuestionRequired(event.target.checked)}
                  className="size-4 accent-gdg-blue"
                />
                {t("questions.requiredToggle")}
              </label>

              {questionError && (
                <p role="alert" className={`${styles.error} mb-3`}>
                  {questionError}
                </p>
              )}

              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className={`${styles.outlineButton} border-border text-foreground hover:bg-surface-muted`}
                >
                  {t("questions.cancel")}
                </button>
                <button type="button" onClick={handleAddQuestion} className={styles.primaryButton}>
                  {t("questions.submit")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowQuestionForm(true)}
              className="mb-2 inline-flex w-fit items-center gap-1 py-2 text-sm font-semibold text-gdg-red hover:underline"
            >
              {t("questions.add")}
              <Plus className="size-4" aria-hidden="true" />
            </button>
          )}

          {errorCount > 0 && (
            <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              {t("errors.summary", { count: errorCount })}
            </p>
          )}

          {saveError && (
            <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              {saveError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground/85 sm:me-auto">
              {t("fields.status")}
              <select
                id={fieldId("status")}
                value={publishStatus}
                onChange={(event) => setPublishStatus(event.target.value === "draft" ? "draft" : "publish")}
                className="min-h-[44px] rounded-[10px] border border-border bg-surface px-3 text-sm text-foreground focus:border-gdg-blue focus:outline-none"
              >
                <option value="publish">{t("statusOptions.publish")}</option>
                <option value="draft">{t("statusOptions.draft")}</option>
              </select>
            </label>
            <button
              type="button"
              onClick={requestClose}
              className={`${styles.outlineButton} border-gdg-blue/60 text-gdg-blue hover:bg-gdg-blue/5`}
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className={`${styles.outlineButton} border-gdg-blue text-gdg-blue hover:bg-gdg-blue/5`}
            >
              {t("actions.preview")}
            </button>
            <button type="submit" disabled={saving} className={`${styles.primaryButton} disabled:opacity-60`}>
              {publishStatus === "draft" ? t("actions.saveDraft") : t("actions.publish")}
            </button>
          </div>
        </form>
      </section>

      {showPreview && (
        <EventPreviewModal
          data={{
            ...values,
            title: values.title.trim(),
            imageUrl: image?.url ?? null,
            questions,
          }}
          onEdit={() => setShowPreview(false)}
          onPublish={handlePublish}
        />
      )}

      {publishedEvent && (
        <EventPublishedModal
          eventTitle={publishedEvent.title}
          onClose={() => onClose?.()}
          onViewEvent={() => {
            if (publishedEvent.id && onViewEvent) onViewEvent(publishedEvent.id);
            else onClose?.();
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => onClose?.()}
        title={t("discard.title")}
        message={t("discard.message")}
        confirmText={t("discard.confirm")}
        cancelText={t("discard.keep")}
        danger
      />
    </div>
  );
}
