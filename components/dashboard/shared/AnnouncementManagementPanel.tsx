"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Eye, ImagePlus, Megaphone, Pencil, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { API_ENABLED } from "@/lib/api/client";
import { deleteAnnouncement, fetchManagedAnnouncements, publishAnnouncement, updateAnnouncement, uploadAnnouncementImage, type CreateAnnouncementInput } from "@/lib/announcements/api";
import { announcementCategories, type Announcement, type AnnouncementCategory } from "@/lib/announcements/types";
import { useTextDirection } from "@/i18n/useTextDirection";
import { CategoryBadge } from "@/components/announcements/CategoryBadge";

const emptyForm = {
  title: "",
  excerpt: "",
  category: "community" as AnnouncementCategory,
  body: "",
  actionLabel: "",
  actionHref: "",
  pinned: false,
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function AnnouncementManagementPanel() {
  const t = useTranslations("dashboard.announcements");
  const tValidation = useTranslations("dashboard.validation");
  const tCategories = useTranslations("announcements.categories");
  const dir = useTextDirection();
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<"DRAFT" | "PUBLISHED" | null>(null);
  const [loading, setLoading] = useState(API_ENABLED);
  const [publishing, setPublishing] = useState(false);
  const [publishingDraftId, setPublishingDraftId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"title" | "excerpt" | "body" | "actionLabel" | "actionHref", string>>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    fetchManagedAnnouncements().then((result) => {
      if (!active) return;
      if (result.ok) setItems(result.data);
      else setError(result.status === 403 ? t("forbidden") : result.status === 401 ? t("unauthorized") : t("loadError"));
      setLoading(false);
    });
    return () => { active = false; };
  }, [t]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const requestedStatus = submitter instanceof HTMLButtonElement && submitter.value === "DRAFT" ? "DRAFT" : "PUBLISHED";
    setError("");
    setSuccess("");
    const nextFieldErrors: typeof fieldErrors = {};
    const title = form.title.trim();
    const excerpt = form.excerpt.trim();
    const body = form.body.trim();
    const actionLabel = form.actionLabel.trim();
    const actionHref = form.actionHref.trim();
    if (requestedStatus === "PUBLISHED" && title.length < 3) nextFieldErrors.title = tValidation("titleRequired");
    else if (title.length > 200) nextFieldErrors.title = tValidation("titleTooLong");
    if (requestedStatus === "PUBLISHED" && excerpt.length < 10) nextFieldErrors.excerpt = tValidation("excerptRequired");
    else if (excerpt.length > 500) nextFieldErrors.excerpt = tValidation("excerptTooLong");
    if (body.length > 10000) nextFieldErrors.body = tValidation("bodyTooLong");
    if (actionLabel.length > 80) nextFieldErrors.actionLabel = tValidation("actionLabelTooLong");
    else if (actionLabel.length > 0 && actionLabel.length < 2) nextFieldErrors.actionLabel = tValidation("actionLabelTooShort");
    if (actionHref.length > 2048) nextFieldErrors.actionHref = tValidation("actionHrefTooLong");
    else if (actionHref && !isHttpUrl(actionHref)) nextFieldErrors.actionHref = tValidation("actionHrefInvalid");
    if (requestedStatus === "PUBLISHED" && actionLabel && !actionHref) nextFieldErrors.actionHref = t("fields.actionHrefRequired");
    if (requestedStatus === "PUBLISHED" && actionHref && !actionLabel) nextFieldErrors.actionLabel = tValidation("actionLabelRequired");
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }
    setPublishing(true);
    let imageUrl = currentImageUrl;
    if (imageFile) {
      const upload = await uploadAnnouncementImage(imageFile);
      if (!upload.ok) {
        setPublishing(false);
        setError(upload.status === 403 ? t("forbidden") : upload.status === 401 ? t("unauthorized") : t("imageUploadError"));
        return;
      }
      imageUrl = upload.data.imageUrl;
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(null);
      setCurrentImageUrl(imageUrl);
    }
    const payload: CreateAnnouncementInput = {
      ...form,
      status: requestedStatus,
      title,
      excerpt,
      body: body || undefined,
      imageUrl: imageUrl ?? (editingId ? null : undefined),
      actionLabel: actionLabel || (editingId ? null : undefined),
      actionHref: actionHref || (editingId ? null : undefined),
    };
    const result = editingId
      ? await updateAnnouncement(editingId, payload)
      : await publishAnnouncement(payload);
    setPublishing(false);
    if (!result.ok) {
      setError(result.status === 403 ? t("forbidden") : result.status === 401 ? t("unauthorized") : t("publishError"));
      return;
    }
    setItems((current) => editingId
      ? current.map((item) => item.id === editingId ? result.data : item)
      : [result.data, ...current]);
    setForm(emptyForm);
    setFieldErrors({});
    setCurrentImageUrl(null);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setEditingId(null);
    setEditingStatus(null);
    setIsCreating(false);
    setIsPreviewing(false);
    const successKey = requestedStatus === "DRAFT"
      ? editingId ? "draftUpdated" : "draftSaved"
      : editingId && editingStatus === "PUBLISHED" ? "updated" : "published";
    setSuccess(t(successKey));
  }

  function startEditing(item: Announcement) {
    setEditingId(item.id);
    setEditingStatus(item.publicationStatus ?? "PUBLISHED");
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      body: item.body?.map((block) => block.type === "paragraph" ? typeof block.text === "string" ? block.text : block.text.map((part) => part.text).join("") : "").filter(Boolean).join("\n\n") ?? "",
      actionLabel: item.primaryAction?.label ?? item.draftActionLabel ?? "",
      actionHref: item.primaryAction?.href ?? item.draftActionHref ?? "",
      pinned: item.pinned ?? false,
    });
    setFieldErrors({});
    setCurrentImageUrl(item.media.type === "image" ? item.media.src : null);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setError("");
    setIsCreating(true);
    setIsPreviewing(false);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingStatus(null);
    setForm(emptyForm);
    setFieldErrors({});
    setCurrentImageUrl(null);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setIsCreating(false);
    setIsPreviewing(false);
  }

  async function publishDraft(item: Announcement) {
    setError("");
    const hasIncompleteDetails = item.title.trim().length < 3
      || item.excerpt.trim().length < 10
      || Boolean(item.draftActionLabel) !== Boolean(item.draftActionHref);
    if (hasIncompleteDetails) {
      startEditing(item);
      setError(t("draftNeedsDetails"));
      return;
    }
    setPublishingDraftId(item.id);
    const result = await updateAnnouncement(item.id, { status: "PUBLISHED" });
    setPublishingDraftId(null);
    if (!result.ok) {
      if (result.status === 400) {
        startEditing(item);
        setError(t("draftNeedsDetails"));
        return;
      }
      setError(result.status === 403 ? t("forbidden") : result.status === 401 ? t("unauthorized") : t("publishError"));
      return;
    }
    setItems((current) => current.map((announcement) => announcement.id === item.id ? result.data : announcement));
    setSuccess(t("draftPublished"));
  }

  function selectImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError(t("imageTypeError"));
      return;
    }
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
      setError(t("imageSizeError"));
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setCurrentImageUrl(null);
  }

  async function removeAnnouncement(item: Announcement) {
    if (!window.confirm(t("confirmDelete", { title: item.title }))) return;
    setError("");
    setDeletingId(item.id);
    const result = await deleteAnnouncement(item.id);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.status === 403 ? t("forbidden") : result.status === 401 ? t("unauthorized") : t("deleteError"));
      return;
    }
    setItems((current) => current.filter((announcement) => announcement.id !== item.id));
    if (editingId === item.id) cancelEditing();
    setSuccess(t("deleted"));
  }

  return (
    <section aria-labelledby="announcements-management-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
            <Megaphone aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="announcements-management-heading" className="text-xl font-bold text-foreground">{t("title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("description")}</p>
          </div>
        </div>
        <button type="button" onClick={() => isCreating ? cancelEditing() : setIsCreating(true)} disabled={!API_ENABLED} aria-expanded={isCreating} aria-controls="announcement-create-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Megaphone aria-hidden="true" className="size-4" />
          {isCreating ? t("cancelCreate") : t("newAnnouncement")}
        </button>
      </div>

      {!API_ENABLED ? (
        <p role="alert" className="mt-5 rounded-xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{t("apiDisabled")}</p>
      ) : (
        <>
          {isCreating && <form id="announcement-create-form" noValidate onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-border bg-gradient-to-br from-blue-500/10 via-green-500/5 to-yellow-500/10 p-1 shadow-sm">
            <div className="grid gap-5 rounded-xl bg-surface p-4 sm:p-6">
            <section className="grid gap-4 rounded-2xl border border-border border-s-gdg-red bg-surface-muted/40 p-4 sm:p-5">
              <h3 className="text-base font-bold text-foreground">{t("sections.basics")}</h3>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              {t("fields.title")}
              <input required minLength={3} maxLength={200} aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "announcement-title-error" : undefined} value={form.title} onChange={(event) => { setForm((current) => ({ ...current, title: event.target.value })); setFieldErrors((current) => ({ ...current, title: undefined })); }} className="h-11 rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-blue-500" />
              {fieldErrors.title && <span id="announcement-title-error" className="text-sm text-red-600 dark:text-red-400">{fieldErrors.title}</span>}
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              {t("fields.excerpt")}
              <textarea required minLength={10} maxLength={500} aria-invalid={Boolean(fieldErrors.excerpt)} aria-describedby={fieldErrors.excerpt ? "announcement-excerpt-error" : undefined} rows={3} value={form.excerpt} onChange={(event) => { setForm((current) => ({ ...current, excerpt: event.target.value })); setFieldErrors((current) => ({ ...current, excerpt: undefined })); }} className="resize-y rounded-xl border border-border bg-background p-3 font-normal outline-none focus:border-blue-500" />
              {fieldErrors.excerpt && <span id="announcement-excerpt-error" className="text-sm text-red-600 dark:text-red-400">{fieldErrors.excerpt}</span>}
            </label>
            </section>

            <section className="grid gap-4 rounded-2xl border border-border border-s-gdg-blue bg-surface-muted/40 p-4 sm:p-5">
              <h3 className="text-base font-bold text-foreground">{t("sections.content")}</h3>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              {t("fields.body")}
              <textarea maxLength={10000} aria-invalid={Boolean(fieldErrors.body)} aria-describedby={fieldErrors.body ? "announcement-body-error" : undefined} rows={5} value={form.body} onChange={(event) => { setForm((current) => ({ ...current, body: event.target.value })); setFieldErrors((current) => ({ ...current, body: undefined })); }} className="resize-y rounded-xl border border-border bg-background p-3 font-normal outline-none focus:border-blue-500" />
              {fieldErrors.body && <span id="announcement-body-error" className="text-sm text-red-600 dark:text-red-400">{fieldErrors.body}</span>}
            </label>
            </section>

            <section className="grid gap-4 rounded-2xl border border-border border-s-gdg-green bg-surface-muted/40 p-4 sm:p-5">
              <h3 className="text-base font-bold text-foreground">{t("sections.image")}</h3>
              {imagePreview || currentImageUrl ? (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local preview URL or public uploaded image. */}
                  <img src={imagePreview ?? currentImageUrl ?? ""} alt={t("imagePreviewAlt")} className="h-40 w-full rounded-lg object-cover sm:h-28 sm:w-44" />
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="announcement-image" className="cursor-pointer rounded-lg border border-gdg-blue px-3 py-2 text-sm font-semibold text-gdg-blue transition hover:bg-gdg-blue/5">{t("replaceImage")}</label>
                    <button type="button" onClick={removeImage} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30">{t("removeImage")}</button>
                    {imageFile && <span className="w-full truncate text-xs text-muted">{imageFile.name}</span>}
                  </div>
                </div>
              ) : (
                <label htmlFor="announcement-image" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectImage(event.dataTransfer.files?.[0]); }} className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gdg-green/40 bg-surface p-6 text-center transition hover:border-gdg-green hover:bg-gdg-green/5">
                  <ImagePlus aria-hidden="true" className="size-9 text-gdg-green" />
                  <span className="text-sm font-semibold text-foreground">{t("imageUploadTitle")}</span>
                  <span className="text-xs text-muted">{t("imageUploadHint")}</span>
                </label>
              )}
              <input id="announcement-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ""; }} />
            </section>

            <section className="grid gap-4 rounded-2xl border border-border border-s-gdg-yellow bg-surface-muted/40 p-4 sm:p-5">
              <h3 className="text-base font-bold text-foreground">{t("sections.publishing")}</h3>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              {t("fields.category")}
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as AnnouncementCategory }))} className="h-11 rounded-xl border border-border bg-surface px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                {announcementCategories.map((category) => <option key={category} value={category}>{tCategories(category)}</option>)}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                {t("fields.actionLabel")}
                <input maxLength={80} aria-invalid={Boolean(fieldErrors.actionLabel)} aria-describedby={fieldErrors.actionLabel ? "announcement-action-label-error" : undefined} value={form.actionLabel} onChange={(event) => { setForm((current) => ({ ...current, actionLabel: event.target.value })); setFieldErrors((current) => ({ ...current, actionLabel: undefined })); }} className="h-11 rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-blue-500" />
                {fieldErrors.actionLabel && <span id="announcement-action-label-error" className="text-sm text-red-600 dark:text-red-400">{fieldErrors.actionLabel}</span>}
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                {t("fields.actionHref")}
                <input type="url" maxLength={2048} dir="ltr" aria-invalid={Boolean(fieldErrors.actionHref)} aria-describedby={fieldErrors.actionHref ? "announcement-action-href-error" : undefined} value={form.actionHref} onChange={(event) => { setForm((current) => ({ ...current, actionHref: event.target.value })); setFieldErrors((current) => ({ ...current, actionHref: undefined })); }} className="h-11 rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-blue-500" />
                {fieldErrors.actionHref && <span id="announcement-action-href-error" className="text-sm text-red-600 dark:text-red-400">{fieldErrors.actionHref}</span>}
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.pinned} onChange={(event) => setForm((current) => ({ ...current, pinned: event.target.checked }))} className="size-4 accent-blue-600" />
              {t("fields.pinned")}
            </label>
            </section>

            {isPreviewing && (
              <section aria-label={t("preview.title")} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-4 py-3">
                  <h3 className="font-bold text-foreground">{t("preview.title")}</h3>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">{t("preview.unpublished")}</span>
                </div>
                {(imagePreview || currentImageUrl) ? (
                  <div className="relative h-52 overflow-hidden bg-surface-muted sm:h-64">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview URL or public uploaded image. */}
                    <img src={imagePreview ?? currentImageUrl ?? ""} alt={t("imagePreviewAlt")} className="size-full object-cover" />
                  </div>
                ) : <div aria-hidden="true" className="h-3 bg-[image:var(--google-gradient)]" />}
                <div className="grid gap-3 p-5 sm:p-7">
                  <CategoryBadge category={form.category} />
                  <h4 className="text-2xl font-bold text-foreground">{form.title.trim() || t("preview.titlePlaceholder")}</h4>
                  <p className="text-muted">{form.excerpt.trim() || t("preview.excerptPlaceholder")}</p>
                  {form.body.trim().split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap leading-7 text-foreground/85">{paragraph}</p>)}
                  {form.actionLabel.trim() && form.actionHref.trim() && <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white">{form.actionLabel}<ArrowUpRight aria-hidden="true" className={`size-4 ${dir === "rtl" ? "-scale-x-100" : ""}`} /></span>}
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={() => setIsPreviewing((current) => !current)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2.5 font-semibold text-foreground transition hover:bg-surface-muted">
                <Eye aria-hidden="true" className="size-4" /> {isPreviewing ? t("preview.hide") : t("preview.button")}
              </button>
              <button type="submit" value="DRAFT" formNoValidate disabled={publishing} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gdg-blue px-4 py-2.5 font-semibold text-gdg-blue transition hover:bg-gdg-blue/5 disabled:cursor-not-allowed disabled:opacity-60">
                {publishing ? t(imageFile ? "uploading" : "saving") : t("saveDraft")}
              </button>
              <button type="submit" value="PUBLISHED" disabled={publishing} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                <Send aria-hidden="true" className="size-4" />
                {publishing ? t(imageFile ? "uploading" : "publishing") : t(editingStatus === "PUBLISHED" ? "saveChanges" : "publishButton")}
              </button>
            </div>
            </div>
          </form>}

          {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          {success && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{success}</p>}

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-base font-bold text-foreground">{t("recentTitle")}</h3>
            {loading ? <p className="mt-4 text-sm text-muted">{t("loading")}</p> : items.length === 0 ? <p className="mt-4 text-sm text-muted">{t("empty")}</p> : (
              <ul className="mt-3 divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{item.title}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${item.publicationStatus === "DRAFT" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"}`}>{t(`status.${item.publicationStatus ?? "PUBLISHED"}`)}</span>
                      <p className="mt-1 text-xs text-muted">{tCategories(item.category)}</p>
                      <p className="mt-1 text-xs text-muted">{t(item.publicationStatus === "DRAFT" ? "updatedOn" : "publishedOn", { date: item.publicationStatus === "DRAFT" ? item.updatedAt ?? item.publishedAt : item.publishedAt })}</p>
                    </div>
                    {item.publicationStatus === "DRAFT" ? (
                      <button type="button" onClick={() => void publishDraft(item)} disabled={publishingDraftId === item.id} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50 dark:text-emerald-400">
                        <Send aria-hidden="true" className="size-4" /> {publishingDraftId === item.id ? t("publishing") : t("publishDraft")}
                      </button>
                    ) : (
                      <Link href={`/announcements/${item.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        {t("viewPublished")} <ArrowUpRight aria-hidden="true" className="size-4" />
                      </Link>
                    )}
                    <button type="button" onClick={() => startEditing(item)} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                      <Pencil aria-hidden="true" className="size-4" /> {t("edit")}
                    </button>
                    <button type="button" onClick={() => void removeAnnouncement(item)} disabled={deletingId === item.id} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline disabled:opacity-50 dark:text-red-400">
                      <Trash2 aria-hidden="true" className="size-4" /> {deletingId === item.id ? t("deleting") : t("delete")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
