"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Announcement } from "@/lib/announcements/types";

type AnnouncementCardProps = {
  announcement: Announcement;
};

const categoryConfig = {
  recruitment: {
    label: "Recruitment",
    color: "var(--gdg-red)",
  },
  events: {
    label: "Events",
    color: "var(--gdg-green)",
  },
  results: {
    label: "Results",
    color: "var(--gdg-yellow)",
  },
  community: {
    label: "Community",
    color: "var(--gdg-blue)",
  },
  workshops: {
    label: "Workshops",
    color: "var(--gdg-red)",
  },
  trip: {
    label: "Trip",
    color: "var(--gdg-green)",
  },
} as const;

const artworkConfig = {
  navy: {
    primary: "var(--gdg-blue)",
    secondary: "var(--gdg-yellow)",
  },
  forest: {
    primary: "var(--gdg-green)",
    secondary: "var(--gdg-blue)",
  },
  plum: {
    primary: "var(--gdg-red)",
    secondary: "var(--gdg-blue)",
  },
  ocean: {
    primary: "var(--gdg-blue)",
    secondary: "var(--gdg-green)",
  },
  ember: {
    primary: "var(--gdg-red)",
    secondary: "var(--gdg-yellow)",
  },
  pine: {
    primary: "var(--gdg-green)",
    secondary: "var(--gdg-yellow)",
  },
} as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function AnnouncementCard({
  announcement,
}: AnnouncementCardProps) {
  const category =
    categoryConfig[announcement.category] ?? categoryConfig.community;

  const artwork =
  announcement.media.type === "artwork"
    ? artworkConfig[announcement.media.artwork] ?? artworkConfig.navy
    : artworkConfig.navy;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        group
        relative
        flex
        h-full
        min-h-[clamp(26rem,42vw,29.375rem)]
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-border
        bg-surface
        transition-colors
      "
    >
      {/* Artwork */}
      <div
        className="
          relative
          h-[clamp(10rem,18vw,12rem)]
          shrink-0
          overflow-hidden
        "
        style={{
          background: announcement.media.type === "image" ? "var(--surface-muted)" : `
            radial-gradient(
              circle at 25% 25%,
              color-mix(in srgb, ${artwork.primary} 90%, transparent),
              transparent 45%
            ),
            radial-gradient(
              circle at 80% 75%,
              color-mix(in srgb, ${artwork.secondary} 85%, transparent),
              transparent 48%
            ),
            linear-gradient(
              135deg,
              color-mix(in srgb, ${artwork.primary} 32%, var(--surface)),
              var(--surface)
            )
          `,
        }}
      >
        {announcement.media.type === "image" && (
          <Image src={announcement.media.src} alt={announcement.media.alt} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        )}
        {/* Diagonal pattern */}
        <div
          className={`
            absolute
            inset-0
            ${announcement.media.type === "image" ? "hidden" : "opacity-20"}
          `}
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                135deg,
                transparent 0,
                transparent 10px,
                color-mix(in srgb, var(--white) 20%, transparent) 10px,
                color-mix(in srgb, var(--white) 20%, transparent) 11px
              )
            `,
          }}
        />

        {/* Soft glow */}
        {announcement.media.type === "artwork" && <div
          className="
            absolute
            -right-16
            -top-20
            h-44
            w-44
            rounded-full
            blur-3xl
            opacity-50
          "
          style={{
            backgroundColor: artwork.secondary,
          }}
        />}

        {/* Pinned */}
        {announcement.pinned && (
          <div
            className="
              absolute
              left-5
              top-5
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[var(--white)]
              px-3
              py-1.5
              text-xs
              font-semibold
              text-[var(--black)]
              shadow-lg
            "
          >
            <span aria-hidden="true">📌</span>
            <span>Pinned</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category */}
        <div className="mb-4">
          <span
            className="
              inline-flex
              rounded-full
              border
              px-3
              py-1
              text-xs
              font-semibold
            "
            style={{
              color: category.color,
              borderColor: category.color,
              backgroundColor: `color-mix(in srgb, ${category.color} 8%, transparent)`,
            }}
          >
            {category.label}
          </span>
        </div>

        {/* Date */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M16 2V6M8 2V6M3 10H21"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>

          <span>{formatDate(announcement.publishedAt)}</span>
        </div>

        {/* Title */}
        <h3
          className="
            text-xl
            font-semibold
            leading-[1.25]
            text-foreground
            transition-colors
            group-hover:text-gdg-blue
          "
        >
          {announcement.title}
        </h3>

        {/* Excerpt */}
        <p
          className="
            mt-4
            line-clamp-4
            text-sm
            leading-6
            text-muted
          "
        >
          {announcement.excerpt}
        </p>

        {/* Bottom */}
        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            border-t
            border-border
            pt-5
          "
        >
          <Link
            href={`/announcements/${announcement.slug}`}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gdg-blue
              transition-transform
              group-hover:translate-x-1
            "
          >
            <span>Read more</span>

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
          </Link>

          {announcement.readTimeMinutes && (
            <span className="text-xs text-muted">
              {announcement.readTimeMinutes} min read
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
