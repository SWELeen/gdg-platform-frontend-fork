"use client";

import { events } from "@/data/home";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getPublishedHomeEventsSnapshot, readPublishedHomeEvents, subscribeToPublishedHomeEvents } from "@/lib/events/published-home-events";
import { GrNext, GrPrevious } from "react-icons/gr";
import EventCard from "./EventCard";
import type { HomeEvent } from "./EventCard";
import EventRegistrationModal from "@/components/event-registration/EventRegistrationModal";
import { API_ENABLED, apiRequest } from "@/lib/api/client";
import { fetchPublishedEvents, formatDate, formatTime } from "@/lib/events/api";
import { useRouter, usePathname } from "@/i18n/navigation";

const GAP = 24;

export default function UpcomingEvents() {
  const t = useTranslations("home.events");
  const dir = useTextDirection();
  const router = useRouter();
  const pathname = usePathname();
  const [activeEvent, setActiveEvent] = useState(0);
  const [perView, setPerView] = useState(1);
  const [eventToRegister, setEventToRegister] = useState<HomeEvent | null>(null);
  const publishedEventsSnapshot = useSyncExternalStore(
    subscribeToPublishedHomeEvents,
    getPublishedHomeEventsSnapshot,
    () => "[]",
  );
  const [apiEvents, setApiEvents] = useState<HomeEvent[]>([]);
  useEffect(() => {
    if (!API_ENABLED) return;
    fetchPublishedEvents().then((list) =>
      setApiEvents(
        list.map((event) => ({
          id: String(event.eventId),
          image: event.imageUrl || "/images/event-placeholder.png",
          name: event.name,
          date: formatDate(event.startsAt),
          time: formatTime(event.startsAt),
          location: event.location ?? "",
          description: event.description ?? undefined,
          registrationOpen: event.registrationOpen,
        })),
      ),
    );
  }, []);
  const homepageEvents = useMemo<HomeEvent[]>(() => {
    if (API_ENABLED) return apiEvents;
    try {
      const published = JSON.parse(publishedEventsSnapshot) as HomeEvent[];
      return [...published, ...events];
    } catch {
      return [...readPublishedHomeEvents(), ...events];
    }
  }, [publishedEventsSnapshot, apiEvents]);

  const trackRef = useRef<HTMLDivElement>(null);
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

  const maxIndex = Math.max(0, homepageEvents.length - perView);

  useEffect(() => {
    if (!API_ENABLED || homepageEvents.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("registerEvent");
    if (!eventId) return;
    const event = homepageEvents.find((item) => item.id === eventId);
    if (!event) return;
    window.history.replaceState(null, "", `${pathname}#events`);
    if (event.registrationOpen === false) return;
    const openModal = window.setTimeout(() => setEventToRegister(event), 0);
    return () => window.clearTimeout(openModal);
  }, [homepageEvents, pathname]);

  const handleRegister = async (event: HomeEvent) => {
    if (event.registrationOpen === false) return;
    if (!API_ENABLED) {
      setEventToRegister(event);
      return;
    }

    const identity = await apiRequest<{ fullName: string }>("/me");
    if (identity.ok) {
      setEventToRegister(event);
      return;
    }

    const returnTo = `${pathname}?registerEvent=${encodeURIComponent(event.id)}#events`;
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  // كم كارد يظهر في نفس الوقت (1 على الجوال، 2 على الشاشات الكبيرة)
  useEffect(() => {
    const update = () => {
      const track = trackRef.current;
      const first = eventRefs.current[0];
      if (!track || !first) return;

      setPerView(
        Math.max(1, Math.round((track.clientWidth + GAP) / (first.offsetWidth + GAP)))
      );
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = (index: number) => {
    const target = Math.min(Math.max(index, 0), maxIndex);

    setActiveEvent(target);

    eventRefs.current[target]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    const first = eventRefs.current[0];
    if (!track || !first) return;

    const index = Math.round(Math.abs(track.scrollLeft) / (first.offsetWidth + GAP));
    setActiveEvent(Math.min(index, maxIndex));
  };

  return (
    <section id="events" className="bg-background px-6 py-16 lg:px-10 lg:py-20">
      <div className="max-w-2xl">
        <p
          dir={dir}
          className="mb-3 text-xs font-medium uppercase tracking-widest text-gdg-blue"
        >
          {t("label")}
        </p>

        <h2
          dir={dir}
          className="text-4xl font-bold leading-snug text-foreground md:text-5xl"
        >
          {t("title")}{" "}
          <span className="bg-[image:var(--google-gradient)] bg-clip-text pe-1 italic text-transparent rtl:not-italic">
            {t("highlight")}
          </span>
        </h2>

        <p dir={dir} className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-10">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          style={{ gap: GAP }}
          className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto py-2"
        >
          {homepageEvents.map((event, index) => (
            <div
              key={event.id}
              ref={(element) => {
                eventRefs.current[index] = element;
              }}
              className="w-full shrink-0 snap-start lg:w-[calc((100%-24px)/2)]"
            >
              <EventCard event={event} onRegister={handleRegister} />
            </div>
          ))}
        </div>
      </div>

      {maxIndex > 0 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label={t("previous")}
            onClick={() => goTo(activeEvent - 1)}
            disabled={activeEvent === 0}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm disabled:cursor-default disabled:opacity-50"
          >
            <GrPrevious className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-colors ${
                  index === activeEvent ? "bg-foreground" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label={t("next")}
            onClick={() => goTo(activeEvent + 1)}
            disabled={activeEvent === maxIndex}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm disabled:cursor-default disabled:opacity-50"
          >
            <GrNext className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </button>
        </div>
      )}

      {eventToRegister && (
        <EventRegistrationModal
          event={eventToRegister}
          onClose={() => setEventToRegister(null)}
        />
      )}
    </section>
  );
}
