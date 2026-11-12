import { useTranslations } from "next-intl";
import { PillAction } from "./PillAction";
import { announcementsContainer } from "./styles";

export function AnnouncementsCTA() {
  const t = useTranslations("announcements.cta");

  return (
    <section aria-labelledby="announcements-cta-heading" className={`${announcementsContainer} py-16 lg:py-20`}>
      <div className="rounded-card bg-[linear-gradient(100deg,var(--gdg-blue)_0%,color-mix(in_srgb,var(--gdg-blue)_40%,var(--gdg-red))_28%,var(--gdg-red)_52%,var(--gdg-yellow)_78%,var(--gdg-green)_100%)] px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
        <h2
          id="announcements-cta-heading"
          className="max-w-[min(64rem,78%)] text-[clamp(1.3062rem,1.14rem_+_0.5225vw,1.9rem)] font-bold leading-snug text-[var(--white)] max-sm:max-w-full"
        >
          {t("title")}
        </h2>
        <p className="mt-3 max-w-[min(52rem,100%)] text-[clamp(0.8312rem,0.779rem_+_0.19vw,1.0687rem)] text-[var(--white)]/90">
          {t("description")}
        </p>
        <PillAction href="/signup" variant="light" className="mt-6 border-transparent">
          {t("button")}
        </PillAction>
      </div>
    </section>
  );
}
