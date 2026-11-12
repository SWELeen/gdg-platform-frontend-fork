"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

type CommitteePersonCardProps = {
  image?: string;
  alt: string;
  label: string;
  name: string;
  dir: "rtl" | "ltr";
  accentColor: string;
  index: number;
  layoutClass: string;
  imageScaleClass?: string;
  imagePositionClass?: string;
  linkedin?: string;
  x?: string;
  googleAccent?: boolean;
};

export default function CommitteePersonCard({
  label,
  name,
  dir,
  index,
  layoutClass,
  linkedin,
  x,
}: CommitteePersonCardProps) {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("home.leadership.social");
  const linkedinHref = linkedin?.trim() && linkedin.trim() !== "#" ? linkedin.trim() : undefined;
  const xHref = x?.trim() && x.trim() !== "#" ? x.trim() : undefined;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: "calc(var(--spacing) * 2.5)" }}
      animate={{ opacity: 1, y: "calc(var(--spacing) * 0)", scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 0.68, 0, 1], delay: reduceMotion ? 0 : 0.3 + index * 0.08 }}
      className={`relative flex min-w-0 flex-col py-2 text-center ${layoutClass}`}
    >
      <div dir={dir} className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-full px-1 py-1">
          <div className="flex items-center justify-center">
            <p className="w-fit max-w-full text-xs leading-none font-medium text-white/60">
              {label}
            </p>
          </div>
          <h4 className="mt-1 text-xl leading-normal font-semibold break-words text-white">{name}</h4>
        </div>
        <div className="relative z-10 mt-auto flex items-center justify-center gap-2 pt-1">
          {linkedinHref ? (
            <motion.a
              href={linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}: ${t("linkedin")}`}
              whileHover={reduceMotion ? undefined : { scale: 1.2, rotate: 8 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-linkedin-blue text-white transition-transform motion-safe:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </motion.a>
          ) : (
            <button type="button" disabled aria-label={`${name}: ${t("linkedin")}`} className="pointer-events-auto flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full bg-linkedin-blue text-white opacity-50">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </button>
          )}
          {xHref ? (
            <motion.a
              href={xHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}: ${t("x")}`}
              whileHover={reduceMotion ? undefined : { scale: 1.2, rotate: 8 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background transition-transform motion-safe:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </motion.a>
          ) : (
            <button type="button" disabled aria-label={`${name}: ${t("x")}`} className="pointer-events-auto flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full bg-foreground text-background opacity-50">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
