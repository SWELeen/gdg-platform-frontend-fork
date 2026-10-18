"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type AuthCardProps = {
  size: "sm" | "md" | "lg";
  compact?: boolean;
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

// `lg` is the tall signup card. It sizes to its own content — capping it with a
// max-height would push the overflow past the rounded border. The surrounding
// form panel scrolls instead when the viewport is short.
const sizeClasses = {
  sm: "md:w-109.5 md:h-120!",
  md: "md:w-109.5 md:h-130!",
  lg: "md:w-full md:max-w-135 md:pt-4",
} as const;

export default function AuthCard({
  size,
  compact = false,
  title,
  description,
  className = "",
  children,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative flex h-auto w-full flex-col items-center bg-surface px-8.75 pt-10.25 md:rounded-[20px] md:shadow-[0_0_15px_rgba(0,0,0,0.15)] ${compact && size === "md" ? "md:w-109.5 md:h-112!" : compact && size === "sm" ? "md:w-109.5 md:h-96!" : sizeClasses[size]} ${className}`}
    >
      {title && (
        <h1 className="text-center text-3xl font-bold leading-tight md:text-4xl">
          {title}
        </h1>
      )}

      {description && (
        <p className="mt-2 text-center text-sm text-foreground/45">
          {description}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex w-full flex-1 flex-col"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
