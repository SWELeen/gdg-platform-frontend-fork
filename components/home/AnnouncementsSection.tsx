"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Announcement } from "@/lib/announcements/types";
import AnnouncementCard from "./AnnouncementCard";

type AnnouncementsSectionProps = {
  announcements: Announcement[];
  announcementsHref?: string;
};

const ITEMS_PER_PAGE = 4;

export default function AnnouncementsSection({
  announcements,
  announcementsHref = "/announcements",
}: AnnouncementsSectionProps) {
  const t = useTranslations("home.announcements");
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(
    announcements.length / ITEMS_PER_PAGE
  );

  const visibleAnnouncements = announcements.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

//   const hasPrevious = currentPage > 0;
//   const hasNext = currentPage < totalPages - 1;

//   const goPrevious = () => {
//     if (!hasPrevious) return;

//     setCurrentPage((page) => page - 1);
//   };

//   const goNext = () => {
//     if (!hasNext) return;

//     setCurrentPage((page) => page + 1);
//   };

  return (
    <section
      id="announcements"
      className="
        relative
        overflow-hidden
        bg-background
        px-6 py-16 lg:px-10 lg:py-20
      "
    >
      {/* Background decoration */}

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40
          h-[420px]
          w-[420px]
          rounded-full
          blur-3xl
          opacity-10
        "
        style={{
          backgroundColor: "var(--gdg-blue)",
        }}
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-48
          -left-40
          h-[420px]
          w-[420px]
          rounded-full
          blur-3xl
          opacity-10
        "
        style={{
          backgroundColor: "var(--gdg-blue)",
        }}
      />

      <div className="relative mx-auto w-full">
        {/* Header */}

        <div
          className="
            mb-12
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-[700px]">
      <h2 className="text-4xl font-bold leading-snug text-foreground md:text-5xl">
        {t("title")}{" "}
        <span className="bg-[image:var(--google-gradient)] bg-clip-text pe-1 italic text-transparent rtl:not-italic">
          {t("highlight")}
        </span>
      </h2>
          </div>

          {/* View all */}

          <motion.a
            href={announcementsHref}
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="
              inline-flex
              h-[54px]
              shrink-0
              items-center
              justify-center
              gap-4
              rounded-full
              border
              border-gdg-blue
              px-6
              text-sm
              font-semibold
              text-foreground
              transition-colors
              hover:bg-gdg-blue/10
            "
          >
            <span>{t("viewAll")}</span>

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>

        {/* Cards */}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}

        {totalPages > 1 && (
          <div
            className="
              mt-10
              flex
              items-center
              justify-center
              gap-3
            "
          >
            {/* Previous */}

            {/* <button
              type="button"
              onClick={goPrevious}
              disabled={!hasPrevious}
              aria-label="Previous announcements"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-border
                text-foreground
                transition-all
                hover:border-gdg-blue
                hover:text-gdg-blue
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button> */}

            {/* Indicators */}

            {/* <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  aria-label={`Go to announcement page ${
                    index + 1
                  }`}
                  className="
                    h-2
                    rounded-full
                    transition-all
                  "
                  style={{
                    width:
                      currentPage === index
                        ? "32px"
                        : "10px",
                    backgroundColor:
                      currentPage === index
                        ? "var(--gdg-blue)"
                        : "color-mix(in srgb, var(--foreground) 15%, transparent)",
                  }}
                />
              ))}
            </div> */}

            {/* Next */}

            {/* <button
              type="button"
              onClick={goNext}
              disabled={!hasNext}
              aria-label="Next announcements"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-border
                text-foreground
                transition-all
                hover:border-gdg-blue
                hover:text-gdg-blue
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button> */}
          </div>
        )}
      </div>
    </section>
  );
}