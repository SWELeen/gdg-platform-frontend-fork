"use client";

import Image from "next/image";
import { SpeakerCard } from "./SpeakerCard";
import type { EventInfoData } from "@/data/event-registration";
import { useTranslations } from "next-intl";

type EventInfoProps = {
  event: EventInfoData;
};

export function EventInfo({ event }: EventInfoProps) {
  const t = useTranslations("eventRegistration");
  return (
    <section className="bg-surface-muted px-2 py-3 sm:px-4 lg:px-5 lg:py-7">
      <div className="mx-auto flex w-full max-w-xl flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
          <Image
            src={event.imageSrc}
            alt={event.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
          />
        </div>

        <div dir="rtl" className="mt-4 text-start">
          <h1 className="text-xl font-semibold leading-[1.5] text-foreground sm:text-2xl">
            {event.name}
          </h1>

          <p className="mt-3 text-sm leading-6 text-foreground/80">
            {event.description}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-3">
          <div className="px-3 py-3 text-start">
            <p className="font-semibold text-foreground">{t("date")}</p>
            <p className="mt-1 whitespace-nowrap text-xs text-foreground/80">
              {event.date}
            </p>
          </div>

          <div className="border-border px-3 py-3 text-start sm:border-s">
            <p className="font-semibold text-foreground">{t("time")}</p>
            <p className="mt-1 whitespace-nowrap text-xs text-foreground/80">
              {event.time}
            </p>
          </div>

          <div className="border-border px-3 py-3 text-start sm:border-s">
            <p className="font-semibold text-foreground">{t("location")}</p>
            <p className="mt-1 whitespace-nowrap text-xs text-foreground/80">
              {event.location}
            </p>
          </div>
        </div>

        {(event.speaker || event.speakersText) && (
          <div className="mt-6">
            <p className="mb-2 text-start text-sm font-semibold text-foreground">
              {t("speaker")}
            </p>

            {event.speaker ? (
              <SpeakerCard
                name={event.speaker.name}
                title={event.speaker.title}
                bio={event.speaker.bio}
                imageSrc={event.speaker.imageSrc}
              />
            ) : (
              <p className="whitespace-pre-line rounded-lg border border-border bg-surface p-3 text-start text-sm text-foreground/80">
                {event.speakersText}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
