"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { HomeEvent } from "@/components/home/EventCard";
import { EventInfo } from "./EventInfo";
import { eventRegistrationMock, type EventInfoData } from "@/data/event-registration";
import { RegistrationForm } from "./RegistrationForm";
import { API_ENABLED } from "@/lib/api/client";
import { fetchEventDetails, toRegistrationQuestion } from "@/lib/events/api";

type EventRegistrationModalProps = {
  event: HomeEvent;
  onClose: () => void;
};

export default function EventRegistrationModal({
  event,
  onClose,
}: EventRegistrationModalProps) {
  const t = useTranslations("eventRegistration");
  const [questions, setQuestions] = useState(event.registrationQuestions ?? []);
  const [questionsState, setQuestionsState] = useState<"loading" | "ready" | "error">(
    API_ENABLED ? "loading" : "ready",
  );
  const [questionRetry, setQuestionRetry] = useState(0);
  const [details, setDetails] = useState<{ description: string; speakers: string } | null>(null);
  // The card can be stale (a page left open past the deadline), so trust the fresh details.
  const [registrationOpen, setRegistrationOpen] = useState(event.registrationOpen !== false);
  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    void fetchEventDetails(event.id).then((details) => {
      if (!active) return;
      if (!details) {
        setQuestionsState("error");
        return;
      }
      setQuestions(details.questions.map(toRegistrationQuestion));
      setDetails({ description: details.description ?? "", speakers: details.speakers ?? "" });
      setRegistrationOpen(details.registrationOpen);
      setQuestionsState("ready");
    });
    return () => { active = false; };
  }, [event.id, questionRetry]);
  // Demo mode keeps the sample description and speaker; real events show only what their creator entered.
  const eventInfo: EventInfoData = {
    ...(API_ENABLED
      ? { description: details?.description ?? event.description ?? "", speakersText: details?.speakers }
      : eventRegistrationMock),
    name: event.name,
    date: event.date,
    time: event.time,
    location: event.location,
    imageSrc: event.image,
    imageAlt: event.name,
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <EventInfo event={eventInfo} />
        {registrationOpen ? (
          <RegistrationForm
            onClose={onClose}
            questions={questions}
            questionsLoading={questionsState === "loading"}
            questionsError={questionsState === "error"}
            onRetryQuestions={() => {
              setQuestionsState("loading");
              setQuestionRetry((current) => current + 1);
            }}
            eventId={API_ENABLED ? event.id : undefined}
          />
        ) : (
          <p role="status" className="border-t border-border px-5 py-6 text-center text-sm text-muted sm:px-8">
            {t("result.REGISTRATION_CLOSED")}
          </p>
        )}
      </motion.div>
    </div>
  );
}
