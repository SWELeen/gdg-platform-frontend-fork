"use client";

import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { toneColors } from "@/components/dashboard/members/task-styles";
import type { Tone } from "@/components/dashboard/members/task-styles";

// The round "open the full page" arrow used in every dashboard card header.
export function ViewAllBadge({ href, label, tone }: { href: string; label: string; tone: Tone }): ReactElement {
  return (
    <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="inline-flex shrink-0 rounded-full">
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${toneColors[tone]}`}
      >
        <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      </Link>
    </motion.span>
  );
}
