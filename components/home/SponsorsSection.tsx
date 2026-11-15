"use client";

import { sponsors } from "@/data/home";
import { useTranslations } from "next-intl";

function SponsorGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="sponsors-marquee-group flex shrink-0 gap-[clamp(0.75rem,2vw,2rem)] pe-[clamp(0.75rem,2vw,2rem)]"
      aria-hidden={hidden ? true : undefined}
    >
      {sponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          className="size-[clamp(5rem,10vw,15rem)] shrink-0 overflow-hidden rounded-full border border-border"
        >
          <img loading="lazy" decoding="async"
            src={sponsor.image}
            alt={hidden ? "" : sponsor.name}
            className="h-full w-full scale-110 rounded-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function SponsorsSection() {
  const t = useTranslations("home.sponsors");

  return (
    <section id="sponsors" className="bg-sponsor-gray px-6 py-[clamp(1.25rem,2vw,2rem)]">
      <div className="w-full">
      <h2 className="text-left text-[clamp(1.75rem,1.5rem_+_0.75vw,3rem)] font-bold leading-snug text-foreground">
        {t("title")}{" "}
        <span className="bg-[image:var(--google-gradient)] bg-clip-text pe-1 italic text-transparent rtl:not-italic">
          {t("highlight")}
        </span>
      </h2>

      <p className="mt-4 max-w-[min(56rem,75%)] text-left text-[clamp(0.9025rem,0.855rem_+_0.3135vw,1.235rem)] leading-relaxed text-foreground/60 max-sm:max-w-full">
        {t("subtitle")}
      </p>
      </div>

      <div className="mt-[clamp(2.5rem,5vw,5rem)] overflow-hidden">
        <div className="sponsors-marquee flex w-max">
          <SponsorGroup />
          <SponsorGroup hidden />
          <SponsorGroup hidden />
          <SponsorGroup hidden />
          <SponsorGroup hidden />
          <SponsorGroup hidden />
        </div>
      </div>
    </section>
  );
}
