"use client";

import { MotionConfig, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { useDialog } from "../shared/useDialog";

// Decorative confetti dashes around the check mark, in the four Google colors.
const confetti = [
  { className: "bg-gdg-red", style: { top: "6%", insetInlineStart: "18%", rotate: "-35deg" } },
  { className: "bg-gdg-yellow", style: { top: "38%", insetInlineStart: "4%", rotate: "0deg" } },
  { className: "bg-gdg-blue", style: { bottom: "10%", insetInlineStart: "16%", rotate: "35deg" } },
  { className: "bg-gdg-red", style: { top: "6%", insetInlineEnd: "18%", rotate: "35deg" } },
  { className: "bg-gdg-blue", style: { top: "38%", insetInlineEnd: "4%", rotate: "0deg" } },
  { className: "bg-gdg-yellow", style: { bottom: "10%", insetInlineEnd: "16%", rotate: "-35deg" } },
] as const;

/** "Event Published Successfully" dialog (Create Event, screen 3). */
export function EventPublishedModal({
  eventTitle,
  onViewEvent,
  onClose,
}: {
  eventTitle: string;
  onViewEvent: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard.leader.createEvent.success");
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="event-published-title"
          aria-describedby="event-published-message"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-2xl bg-surface px-6 pb-8 pt-10 text-center text-foreground shadow-2xl outline-none sm:px-10"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="absolute end-4 top-4 flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>

          <div className="relative mx-auto size-28" aria-hidden="true">
            {confetti.map((piece, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.04, duration: 0.25 }}
                className={`absolute h-1 w-3 rounded-full ${piece.className}`}
                style={piece.style}
              />
            ))}
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="absolute inset-5 flex items-center justify-center rounded-full bg-gdg-green text-white"
            >
              <Check className="size-10" strokeWidth={3} />
            </motion.span>
          </div>

          <h2 id="event-published-title" className="mt-4 text-xl font-bold sm:text-2xl">
            {t("title")}
          </h2>
          <div id="event-published-message" className="mt-2 space-y-2 text-sm leading-6 text-muted">
            <p>{t("message", { name: eventTitle })}</p>
            <p className="text-xs">{t("demoNote")}</p>
          </div>

          <button
            type="button"
            onClick={onViewEvent}
            className="mt-6 w-full rounded-lg bg-gdg-blue px-6 py-3 text-base font-semibold text-white transition hover:bg-gdg-blue/90 sm:w-auto sm:min-w-[200px]"
          >
            {t("viewEvent")}
          </button>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
