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
    <footer className="relative isolate mt-auto overflow-hidden bg-white text-foreground dark:bg-gdg-dark dark:text-white">
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
            <stop offset="0%" stopColor="var(--gdg-blue)" />
            <stop offset="33%" stopColor="var(--gdg-green)" />
            <stop offset="66%" stopColor="var(--gdg-yellow)" />
            <stop offset="100%" stopColor="var(--gdg-red)" />
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

      <div className="relative z-10 grid w-full gap-[clamp(2rem,4vw,4rem)] px-6 py-[clamp(1rem,2vw,2rem)] lg:grid-cols-[1.4fr_1fr_0.8fr]">
        <section className="flex flex-col items-start gap-7">
          <Link href="/" aria-label={t("nav.home")} className="inline-flex rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground dark:focus-visible:outline-white">
            <img loading="lazy" decoding="async"
              src="/images/black-logo-with-colors.png"
              width={1252} height={199}
              alt={t("logoAlt")}
              className="footer-logo-light h-auto w-[clamp(14rem,20vw,26rem)] max-w-full object-contain"
            />
            <img loading="lazy" decoding="async"
              src="/images/gdg-logo.png"
              width={1240} height={168}
              alt={t("logoAlt")}
              className="footer-logo-dark h-auto w-[clamp(14rem,20vw,26rem)] max-w-full object-contain"
            />
          </Link>
          <p dir={dir} className="max-w-[min(42rem,100%)] whitespace-pre-line text-[clamp(0.7719rem,0.741rem_+_0.114vw,0.8906rem)] leading-relaxed text-foreground/70 dark:text-white/65">
            {t("footer.tagline")}
          </p>
        </section>

        <section>
          <h3 dir={dir} className="text-[clamp(0.8906rem,0.855rem_+_0.19vw,1.0687rem)] font-bold tracking-wide text-foreground dark:text-white">
            {t("footer.linksTitle")}
          </h3>
          <div className="mt-2 h-1 w-10 rounded-full bg-[var(--gdg-blue)]" />
          <nav aria-label={t("footer.linksTitle")} className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {links.map((link) => {
              const className = "w-fit text-[clamp(0.7719rem,0.741rem_+_0.095vw,0.8906rem)] text-foreground/70 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground dark:text-white/70 dark:hover:text-white dark:focus-visible:outline-white";

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
          <h3 dir={dir} className="text-[clamp(0.8906rem,0.855rem_+_0.19vw,1.0687rem)] font-bold tracking-wide text-foreground dark:text-white">
            {t("footer.contactTitle")}
          </h3>
          <div className="mt-2 h-1 w-10 rounded-full bg-[var(--gdg-green)]" />
          <div className="mt-4 flex items-center gap-3">
            <a
              href={GDG_LINKEDIN_URL}
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-foreground/15 bg-foreground/5 text-foreground/75 transition hover:border-linkedin-blue hover:bg-linkedin-blue hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground dark:border-white/15 dark:bg-white/5 dark:text-white/75 dark:focus-visible:outline-white"
            >
              <FaLinkedinIn className="text-lg" />
            </a>

            <a
              href={GDG_X_URL}
              aria-label="X"
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-full border border-foreground/15 bg-foreground/5 text-foreground/75 transition hover:border-foreground/30 hover:bg-foreground/15 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground dark:border-white/15 dark:bg-white/5 dark:text-white/75 dark:hover:border-white/30 dark:hover:bg-white/15 dark:hover:text-white dark:focus-visible:outline-white"
            >
              <FaXTwitter className="text-lg" />
            </a>
          </div>
        </section>
      </div>

      <div className="relative z-10 border-t border-foreground/10 dark:border-white/10">
        <p dir={dir} className="w-full px-6 py-3 text-center text-[clamp(0.6531rem,0.627rem_+_0.095vw,0.7719rem)] leading-relaxed text-foreground/55 dark:text-white/50">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
