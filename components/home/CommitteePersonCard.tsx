"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

const DEFAULT_MEMBER_IMAGE = "/images/unknown.png";
const darkAccent = [
  "[html[data-theme=dark]_&]:bg-[var(--committee-accent)]",
  "[html[data-theme=dark]_&]:text-white",
  "dark:[html:not([data-theme])_&]:bg-[var(--committee-accent)]",
  "dark:[html:not([data-theme])_&]:text-white",
].join(" ");
const darkText = [
  "[html[data-theme=dark]_&]:text-white",
  "dark:[html:not([data-theme])_&]:text-white",
].join(" ");

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
  darkAccent?: boolean;
  googleAccent?: boolean;
};

export default function CommitteePersonCard({
  image,
  alt,
  label,
  name,
  dir,
  accentColor,
  index,
  layoutClass,
  imageScaleClass,
  imagePositionClass,
  linkedin = "#",
  x = "#",
  darkAccent = false,
  googleAccent = false,
}: CommitteePersonCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: reduceMotion ? 0 : index * 0.1 }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={`group relative mt-2 flex h-auto min-h-[245px] min-w-0 flex-col overflow-visible rounded-2xl border border-foreground/10 bg-background p-2.5 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg sm:min-h-[265px] sm:p-3 ${layoutClass}`}
      style={{ "--committee-accent": accentColor } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className={`absolute -top-2 start-4 z-10 h-2 w-16 rounded-t-md ${googleAccent ? "bg-[image:var(--google-gradient)]" : ""}`}
        style={googleAccent ? undefined : { backgroundColor: accentColor }}
      />
      <div className="mx-auto h-28 w-full max-w-28 overflow-hidden rounded-xl bg-surface-muted sm:h-32 sm:max-w-32">
        <img
          src={image?.trim() ? image : DEFAULT_MEMBER_IMAGE}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`h-full w-full ${imagePositionClass ?? "translate-y-5"} ${imageScaleClass ?? "scale-[1.25]"} object-contain object-bottom motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.3]`}
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(DEFAULT_MEMBER_IMAGE)) {
              event.currentTarget.src = DEFAULT_MEMBER_IMAGE;
            }
          }}
        />
      </div>
      <div dir={dir} className="relative mt-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl rounded-b-xl border border-foreground/10 bg-foreground/[0.03] px-2.5 pb-1.5 pt-3">
        <img src="/images/Google-design%20.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-background/65" />
        <span
          aria-hidden="true"
          className={`absolute inset-x-4 top-0 z-10 h-0.5 rounded-full ${googleAccent ? "bg-[image:var(--google-gradient)]" : ""}`}
          style={googleAccent ? undefined : { backgroundColor: `color-mix(in srgb, ${accentColor} 35%, transparent)` }}
        />
        <div className="relative z-10 mx-auto w-fit max-w-full px-2 py-1.5">
          <p className={`text-xs font-semibold leading-tight sm:text-sm ${googleAccent ? "bg-[image:var(--google-gradient)] bg-clip-text text-transparent" : "text-[var(--committee-accent)]"} ${darkAccent ? darkText : ""}`}>
            {label}
          </p>
          <h4 className="mt-1 break-words text-sm font-bold text-foreground sm:text-base">{name}</h4>
        </div>
        <div className="relative z-10 mt-auto flex items-center justify-center gap-2 pt-2">
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on LinkedIn`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-linkedin-blue text-white transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" />
            </svg>
          </a>
          <a
            href={x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on X`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
