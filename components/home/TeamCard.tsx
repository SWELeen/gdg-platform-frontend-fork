"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";

export type TeamMember = {
  id: string;
  type: string;
  image: string;
  role: string;
  name: string;
  linkedin?: string;
  x?: string;
  imageScaleClass?: string;
  imageHoverScaleClass?: string;
  imagePositionClass?: string;
};

type TeamCardProps = {
  member: TeamMember;
};

export default function TeamCard({ member }: TeamCardProps) {
  const t = useTranslations("home.leadership");
  const dir = useTextDirection();
  const reduce = useReducedMotion();

  const socials = [
    {
      key: "linkedin",
      href: member.linkedin,
      label: t("social.linkedin"),
      style: "bg-linkedin-blue text-[var(--white)]",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z",
    },
    {
      key: "x",
      href: member.x,
      label: t("social.x"),
      style: "bg-foreground text-background",
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
  ];

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-[var(--committee-card-surface)] shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Photo */}
      <div className="relative isolate aspect-[4/4.5] w-full overflow-hidden bg-surface-muted">
        <div aria-hidden="true" className="absolute -inset-5 scale-110 opacity-20 blur-2xl" style={{ background: "radial-gradient(ellipse at 78% 24%, #EA4335 0%, rgb(234 67 53 / 78%) 22%, transparent 58%), linear-gradient(135deg, #4285F4 0%, #34A853 34%, #FBBC04 68%, #EA4335 100%)" }} />
        <img
          src={member.image}
          alt={t(`team.${member.id}.name`)}
          loading="lazy"
          className={`relative z-10 h-full w-full object-contain object-top transition-transform duration-500 ${member.imageScaleClass ?? "scale-[1.08]"} ${member.imagePositionClass ?? ""} ${member.imageHoverScaleClass ?? "group-hover:scale-[1.2]"}`}
        />
      </div>

      {/* Info */}
      <div
        dir={dir}
        className="relative -mt-4 overflow-hidden rounded-t-2xl bg-background px-4 pb-4 pt-4 text-start"
      >
        <img
          src="/images/Google-design%20.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-background/65" />
        <div className="relative z-10">
          <h4 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
            {t(`team.${member.id}.name`)}
          </h4>

          {/* Google Developer Group */}
          <p className="mt-1 text-xs font-normal leading-normal sm:text-sm">
            <span className="text-gdg-blue">G</span>
            <span className="text-gdg-red">o</span>
            <span className="text-gdg-yellow">o</span>
            <span className="text-gdg-blue">g</span>
            <span className="text-gdg-green">l</span>
            <span className="text-gdg-red">e</span>{" "}
            <span className="text-foreground">Developer Group</span>
          </p>

          {/* Role */}
          <p className="text-xs font-normal leading-normal text-foreground sm:text-sm">
            {t(`team.${member.id}.role`)}
          </p>

          {/* Socials */}
          <div className="mt-3 flex items-center gap-2">
            {socials.map((s) => {
              const icon = (
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              );
              const ariaLabel = `${t(`team.${member.id}.name`)} - ${s.label}`;
              const className = `flex h-6 w-6 items-center justify-center rounded-full ${s.style}`;

              return s.href ? (
                <motion.a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  whileHover={reduce ? undefined : { scale: 1.2, rotate: 8 }}
                  whileTap={{ scale: 0.9 }}
                  className={className}
                >
                  {icon}
                </motion.a>
              ) : (
                <button
                  key={s.key}
                  type="button"
                  disabled
                  aria-label={ariaLabel}
                  className={`${className} cursor-not-allowed opacity-50`}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
