"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowUpRight, ChevronDown, LifeBuoy, Search, SearchX } from "lucide-react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { GDG_LINKEDIN_URL, GDG_X_URL } from "@/lib/constants/social-links";
import { helpCategories, helpFaqs, type HelpCategoryId, type HelpFaq } from "./help-content";

/** Member Help & Support: topics → questions → answers, plus search across every topic. */
export function MemberHelpPage() {
  const t = useTranslations("dashboard.memberHelp");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HelpCategoryId | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const topicHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusTopicHeading = useRef(false);

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const searching = normalizedQuery.length > 0;
  const matches = (faq: HelpFaq) =>
    [t(`faqs.${faq.id}.question`), t(`faqs.${faq.id}.answer`), t(`categories.${faq.category}.title`)]
      .join(" ")
      .toLocaleLowerCase(locale)
      .includes(normalizedQuery);

  // Move focus to the topic's heading after choosing a topic, so keyboard and screen
  // reader users land on the questions they asked for.
  useEffect(() => {
    if (focusTopicHeading.current) {
      focusTopicHeading.current = false;
      topicHeadingRef.current?.focus();
    }
  }, [category]);

  const selectCategory = (id: HelpCategoryId | null) => {
    focusTopicHeading.current = id !== null;
    setCategory(id);
    setOpenIds(new Set());
  };

  const toggleFaq = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderFaqList = (faqs: HelpFaq[], listId: string) => (
    <ul id={listId} className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
      {faqs.map((faq) => {
        const open = openIds.has(faq.id);
        return (
          <li key={faq.id}>
            <h3>
              <button
                type="button"
                id={`faq-${faq.id}-button`}
                aria-expanded={open}
                aria-controls={`faq-${faq.id}-panel`}
                onClick={() => toggleFaq(faq.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start text-sm font-semibold text-foreground transition hover:bg-surface-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gdg-blue sm:px-5"
              >
                {t(`faqs.${faq.id}.question`)}
                <ChevronDown
                  className={`size-4 shrink-0 text-muted transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`faq-${faq.id}-panel`}
              role="region"
              aria-labelledby={`faq-${faq.id}-button`}
              hidden={!open}
              className="px-4 pb-4 text-sm leading-6 text-muted sm:px-5"
            >
              <p>{t(`faqs.${faq.id}.answer`)}</p>
              {faq.href && (
                <Link
                  href={faq.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gdg-blue hover:underline"
                >
                  {t(`faqs.${faq.id}.link`)}
                  <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  const activeCategory = helpCategories.find((item) => item.id === category);
  const searchGroups = helpCategories
    .map((item) => ({ ...item, faqs: helpFaqs.filter((faq) => faq.category === item.id && matches(faq)) }))
    .filter((group) => group.faqs.length > 0);
  const searchCount = searchGroups.reduce((sum, group) => sum + group.faqs.length, 0);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Welcome + search (searches every topic) */}
      <section aria-labelledby="help-welcome-title" className="rounded-2xl border border-border bg-surface p-5 shadow-2xs sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gdg-blue-light text-gdg-dark">
            <LifeBuoy className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="help-welcome-title" className="text-xl font-bold text-foreground sm:text-2xl">
              {t("welcome.title")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("welcome.description")}</p>
          </div>
        </div>
        <label className="relative mt-5 block">
          <span className="sr-only">{t("search.label")}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
            maxLength={200}
            className="h-12 w-full rounded-full border border-border bg-surface-muted/60 ps-11 pe-4 text-sm text-foreground placeholder:text-muted focus:border-gdg-blue focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gdg-blue/30"
          />
        </label>
      </section>

      {searching ? (
        /* Search results, grouped by topic */
        <section aria-labelledby="help-search-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="help-search-title" className="text-base font-semibold text-foreground">
              {t("searchResultsTitle")}
            </h2>
            <p className="text-xs text-muted" aria-live="polite">
              {t("resultCount", { count: searchCount })}
            </p>
          </div>
          {searchGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <SearchX className="mx-auto size-9 text-muted" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-foreground">{t("noResultsTitle")}</p>
              <p className="mt-1 text-sm text-muted">{t("noResultsDescription")}</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 rounded-full bg-gdg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-gdg-blue/90"
              >
                {t("clearSearch")}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {searchGroups.map(({ id, icon: Icon, tone, faqs }) => (
                <div key={id}>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className={`flex size-7 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    {t(`categories.${id}.title`)}
                  </p>
                  {renderFaqList(faqs, `help-search-${id}`)}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : activeCategory ? (
        /* One topic: its questions only, with a way back and quick switching */
        <section aria-labelledby="help-topic-title">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/40"
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("backToTopics")}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${activeCategory.tone}`}>
              <activeCategory.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="help-topic-title" ref={topicHeadingRef} tabIndex={-1} className="text-lg font-bold text-foreground outline-none">
                {t(`categories.${activeCategory.id}.title`)}
              </h2>
              <p className="text-xs text-muted">
                {t("resultCount", { count: helpFaqs.filter((faq) => faq.category === activeCategory.id).length })}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("otherTopics")}>
            {helpCategories.map(({ id }) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === activeCategory.id}
                onClick={() => selectCategory(id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue sm:text-sm ${
                  id === activeCategory.id
                    ? "border-transparent bg-gdg-blue text-white"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted"
                }`}
              >
                {t(`categories.${id}.title`)}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {renderFaqList(
              helpFaqs.filter((faq) => faq.category === activeCategory.id),
              "help-topic-questions",
            )}
          </div>
        </section>
      ) : (
        /* Default: browse by topic */
        <section aria-labelledby="help-categories-title">
          <h2 id="help-categories-title" className="mb-3 text-base font-semibold text-foreground">
            {t("categoriesTitle")}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {helpCategories.map(({ id, icon: Icon, tone }) => {
              const questions = helpFaqs.filter((faq) => faq.category === id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectCategory(id)}
                    className="flex h-full w-full flex-col rounded-2xl border border-border bg-surface p-4 text-start shadow-2xs transition hover:border-gdg-blue/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue sm:p-5"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-foreground">{t(`categories.${id}.title`)}</span>
                    </span>
                    <span className="mt-3 block space-y-1" aria-hidden="true">
                      {questions.map((faq) => (
                        <span key={faq.id} className="block text-xs text-muted">
                          • {t(`faqs.${faq.id}.question`)}
                        </span>
                      ))}
                    </span>
                    <span className="mt-3 text-xs font-semibold text-gdg-blue">
                      {t("categoryAction", { count: questions.length })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Contact support: the GDG team's verified public channels only. */}
      <section aria-labelledby="help-contact-title" className="rounded-2xl border border-border bg-surface p-5 shadow-2xs sm:p-6">
        <h2 id="help-contact-title" className="text-base font-bold text-foreground">
          {t("contact.title")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("contact.description")}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={GDG_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2867b2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2867b2]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <FaLinkedinIn aria-hidden="true" />
            {t("contact.linkedin")}
          </a>
          <a
            href={GDG_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
          >
            <FaXTwitter aria-hidden="true" />
            {t("contact.x")}
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">{t("contact.note")}</p>
      </section>
    </div>
  );
}
