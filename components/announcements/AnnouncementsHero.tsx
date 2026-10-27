import { useTranslations } from "next-intl";
import { announcementsContainer } from "./styles";

// Google-colour decorative bars at the inline end of the hero (widths from the design).
const heroBars = [
  { color: "bg-gdg-green", width: "w-[140px]" },
  { color: "bg-gdg-blue", width: "w-[240px]" },
  { color: "bg-gdg-red", width: "w-[186px]" },
  { color: "bg-gdg-yellow", width: "w-[280px]" },
];

export function AnnouncementsHero() {
  const t = useTranslations("announcements.hero");

  return (
    <section className={`${announcementsContainer} flex items-start justify-between gap-10 pt-10 pb-10 lg:pt-14`}>
      <div className="max-w-[520px]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gdg-blue">
          {t("eyebrow")}
        </p>

        <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {t("title")}
          <span className="text-gdg-blue">.</span>
        </h1>

        <div aria-hidden="true" className="mt-2 flex h-[3px] w-[120px] overflow-hidden rounded-full">
          <span className="flex-1 bg-gdg-blue" />
          <span className="flex-1 bg-gdg-red" />
          <span className="flex-1 bg-gdg-yellow" />
          <span className="flex-1 bg-gdg-green" />
        </div>

        <p className="mt-5 text-base text-gray-500 lg:text-lg">{t("description")}</p>

      </div>

      <div aria-hidden="true" className="hidden shrink-0 flex-col items-end gap-2.5 pt-2 md:flex">
        {heroBars.map((bar) => (
          <span key={bar.color} className={`h-2.5 max-w-[24vw] rounded-full ${bar.color} ${bar.width}`} />
        ))}
      </div>
    </section>
  );
}
