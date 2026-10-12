"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, ChevronDown, LifeBuoy, Search, SearchX, X } from "lucide-react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { GDG_LINKEDIN_URL, GDG_X_URL } from "@/lib/constants/social-links";
import { helpCategories, helpFaqs, type HelpCategoryId } from "./help-content";

/** Member Help & Support: searchable, categorized FAQs and verified contact channels. */
export function MemberHelpPage() {
  const t = useTranslations("dashboard.memberHelp");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HelpCategoryId | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const faqSectionRef = useRef<HTMLElement>(null);

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const visibleFaqs = helpFaqs.filter((faq) => {
    if (category && faq.category !== category) return false;
    if (!normalizedQuery) return true;
    const haystack = [t(`faqs.${faq.id}.question`), t(`faqs.${faq.id}.answer`), t(`categories.${faq.category}.title`)]
      .join(" ")
      .toLocaleLowerCase(locale);
    return haystack.includes(normalizedQuery);
  });

  const selectCategory = (id: HelpCategoryId) => {
    setCategory((current) => (current === id ? null : id));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    faqSectionRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const toggleFaq = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearFilters = () => {
    setQuery("");
    setCategory(null);
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Welcome + search */}
      <section
        aria-labelledby="help-welcome-title"
        className="rounded-2xl border border-border bg-surface p-5 shadow-2xs sm:p-8"
      >
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

      {/* Quick help categories */}
      <section aria-labelledby="help-categories-title">
        <h2 id="help-categories-title" className="mb-3 text-base font-semibold text-foreground">
          {t("categoriesTitle")}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {helpCategories.map(({ id, icon: Icon, tone }) => {
            const active = category === id;
            const questions = helpFaqs.filter((faq) => faq.category === id);
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-controls="help-faq-list"
                  onClick={() => selectCategory(id)}
                  className={`flex h-full w-full flex-col rounded-2xl border bg-surface p-4 text-start shadow-2xs transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue sm:p-5 ${
                    active ? "border-gdg-blue ring-1 ring-gdg-blue" : "border-border"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{t(`categories.${id}.title`)}</span>
                  </span>
                  <span className="mt-3 block space-y-1">
                    {questions.map((faq) => (
                      <span key={faq.id} className="block text-xs text-muted">
                        • {t(`faqs.${faq.id}.question`)}
                      </span>
                    ))}
                  </span>
                  <span className="mt-3 text-xs font-semibold text-gdg-blue">
                    {active ? t("categoryShowingAll") : t("categoryAction", { count: questions.length })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* FAQ accordion */}
      <section ref={faqSectionRef} aria-labelledby="help-faq-title" className="scroll-mt-24">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="help-faq-title" className="text-base font-semibold text-foreground">
            {t("faqTitle")}
          </h2>
          <div className="flex items-center gap-2">
            {category && (
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="inline-flex items-center gap-1 rounded-full bg-gdg-blue/10 px-3 py-1 text-xs font-semibold text-gdg-blue hover:bg-gdg-blue/15"
                aria-label={t("removeCategory", { category: t(`categories.${category}.title`) })}
              >
                {t(`categories.${category}.title`)}
                <X className="size-3" aria-hidden="true" />
              </button>
            )}
            <p className="text-xs text-muted" aria-live="polite">
              {t("resultCount", { count: visibleFaqs.length })}
            </p>
          </div>
        </div>

        {visibleFaqs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <SearchX className="mx-auto size-9 text-muted" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">{t("noResultsTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("noResultsDescription")}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-full bg-gdg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-gdg-blue/90"
            >
              {t("clearSearch")}
            </button>
          </div>
        ) : (
          <ul id="help-faq-list" className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
            {visibleFaqs.map((faq) => {
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
        )}
      </section>

      {/* Contact support: the GDG team's verified public channels only. */}
      <section
        aria-labelledby="help-contact-title"
        className="rounded-2xl border border-border bg-surface p-5 shadow-2xs sm:p-6"
      >
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
