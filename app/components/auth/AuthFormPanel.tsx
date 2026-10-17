"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import useDesktopMediaQuery from "@/app/lib/useDesktopMediaQuery";

type AuthFormPanelProps = {
  children: ReactNode;
  scrollableOnDesktop?: boolean;
};

export default function AuthFormPanel({
  children,
  scrollableOnDesktop = false,
}: AuthFormPanelProps) {
  const isDesktop = useDesktopMediaQuery();

  return (
    <motion.section
      layoutId={isDesktop ? "auth-form-panel" : undefined}
      transition={
        isDesktop ? { duration: 0.6, ease: "easeInOut" } : undefined
      }
      className={`relative z-10 flex h-full min-h-0 flex-1 items-center justify-center overflow-y-auto bg-background ${
        scrollableOnDesktop
          ? "lg:items-start lg:overflow-y-auto"
          : "lg:overflow-hidden"
      }`}
    >
      {children}
    </motion.section>
  );
}
