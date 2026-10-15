"use client";

import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { Link } from "@/i18n/navigation";
import { useHomeSectionHref } from "@/components/layout/useHomeSectionHref";
import { GDG_LINKEDIN_URL, GDG_X_URL } from "@/lib/constants/social-links";

export default function Footer() {
  const t = useTranslations("common");
  const dir = useTextDirection();
  const sectionHref = useHomeSectionHref();
  // `route` links are real pages (locale-aware Link); the rest are homepage sections.
  const links = [
    { label: t("nav.home"), href: sectionHref("#home") },
    { label: t("nav.about"), href: sectionHref("#about") },
    { label: t("nav.events"), href: sectionHref("#events") },
    { label: t("nav.announcements"), href: "/announcements", route: true },
    { label: t("nav.projects"), href: sectionHref("#projects") },
    { label: t("nav.community"), href: sectionHref("#committees") },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-gdg-dark text-white">
      <div
        aria-hidden="true"
        className="gdg-spectrum h-1 w-full bg-[length:200%_100%]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 42"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1.5 h-8 w-full opacity-90"
      >
        <defs>
          <linearGradient id="gdg-footer-wave-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#4285f4" />
            <stop offset="33%" stopColor="#34a853" />
            <stop offset="66%" stopColor="#f9ab00" />
            <stop offset="100%" stopColor="#ea4335" />
          </linearGradient>
        </defs>
        <path
          d="M0 20 C180 2 300 38 480 20 S780 2 960 20 S1260 38 1440 20"
          fill="none"
          stroke="url(#gdg-footer-wave-gradient)"
          strokeWidth="3"
        />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 start-1/4 h-36 w-1/2 rounded-full bg-[var(--google-gradient)] opacity-[0.14] blur-3xl"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_1fr_0.8fr] lg:gap-12 lg:px-10 lg:py-9">
        <section className="flex flex-col items-start gap-7">
          <Link href="/" aria-label={t("nav.home")} className="inline-flex rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <img
              src="/images/gdg-logo.png"
              alt={t("logoAlt")}
              className="w-56 max-w-full object-contain sm:w-70"
            />
          </Link>
          <p dir={dir} className="max-w-md text-sm leading-6 text-white/65">
            {t("footer.tagline")}
          </p>
        </section>

        <section>
          <h3 dir={dir} className="text-base font-bold tracking-wide text-white">
            {t("footer.linksTitle")}
          </h3>
          <div className="mt-2 h-1 w-10 rounded-full bg-[var(--gdg-blue)]" />
          <nav aria-label={t("footer.linksTitle")} className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {links.map((link) => {
              const className = "w-fit text-sm text-white/70 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

              return link.route ? (
                <Link key={link.label} href={link.href} dir={dir} className={className}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} dir={dir} className={className}>
                  {link.label}
                </a>
              );
            })}
          </nav>
        </section>

        <section>
          <h3 dir={dir} className="text-base font-bold tracking-wide text-white">
            {t("footer.contactTitle")}
          </h3>
          <div className="mt-2 h-1 w-10 rounded-full bg-[var(--gdg-green)]" />
          <div className="mt-4 flex items-center gap-3">
            <a
              href={GDG_LINKEDIN_URL}
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:border-[#2867b2] hover:bg-[#2867b2] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <FaLinkedinIn className="text-lg" />
            </a>

            <a
              href={GDG_X_URL}
              aria-label="X"
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <FaXTwitter className="text-lg" />
            </a>
          </div>
        </section>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <p dir={dir} className="mx-auto max-w-7xl px-6 py-3 text-center text-xs leading-5 text-white/50 sm:px-8 lg:px-10">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
