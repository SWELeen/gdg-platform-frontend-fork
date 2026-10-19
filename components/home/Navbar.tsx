"use client";

import { useState } from "react";
import Image from "next/image";
import { IoMenu } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTextDirection } from "@/i18n/useTextDirection";
import ThemeToggle from "@/components/ui/ThemeToggle"; 
import { Link, usePathname } from "@/i18n/navigation";
import { useHomeSectionHref } from "@/components/layout/useHomeSectionHref";

// Locale-aware Link with the same hover motion as the hash links.
const MotionLink = motion.create(Link);

type NavbarProps = {
  // "overlay" sits on the homepage video hero; "light" is for pages with a white
  // background (e.g. Announcements), where white text and the white logo would vanish.
  variant?: "overlay" | "light";
};

export default function Navbar({ variant = "overlay" }: NavbarProps = {}) {
  const t = useTranslations("common.nav");
  const tCommon = useTranslations("common");
  const dir = useTextDirection();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const sectionHref = useHomeSectionHref();
  const isAnnouncementsActive =
    pathname === "/announcements" || pathname.startsWith("/announcements/");

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
    },
    open: {
      opacity: 1,
      y: 0,
    },
  };

  // Floating frosted-glass pill (Apple-style), centred with equal insets + auto margins
  // (left-1/2 + translate would squeeze a fit-content fixed box to half the screen).
  // --home-nav-height (globals.css) is the space it takes at the top; sticky sections offset by it.
  return (
    <nav
      className={`fixed inset-x-4 top-4 z-[200] mx-auto flex h-14 items-center justify-between gap-8 rounded-full border ps-5 pe-3 shadow-lg backdrop-blur-xl backdrop-saturate-150 lg:w-fit lg:gap-10 lg:ps-12 lg:pe-8 ${
        variant === "light"
          ? "border-border bg-surface/85 text-foreground shadow-black/5"
          : "border-white/15 bg-gdg-dark/20 text-[var(--white)] shadow-black/20"
      }`}
    >
      <div>
        {variant === "light" ? (
          <Image
            src="/images/black-logo-with-colors.png"
            alt={tCommon("logoAlt")}
            width={1421}
            height={165}
            priority
            unoptimized
            className="h-9 w-auto sm:h-10 lg:h-12 -translate-x-3"
          />
        ) : (
          <img
            src="/images/gdg-white-logo.png"
            alt={tCommon("logoAlt")}
            className="h-14 w-auto"
          />
        )}
      </div>

      <div className="hidden items-center gap-5 whitespace-nowrap lg:flex xl:gap-8">
        <motion.a
          href={sectionHref("#home")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("home")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <motion.a
          href={sectionHref("#about")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("about")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <motion.a
          href={sectionHref("#projects")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("projects")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <motion.a
          href={sectionHref("#events")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("events")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <MotionLink
          href={sectionHref("#announcements")}
          // aria-current={isAnnouncementsActive ? "page" : undefined}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("announcements")}</span>

          {/* Stays underlined while on an Announcements page. */}
          <span className={`mt-1 h-[2px] rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full ${isAnnouncementsActive ? "w-full" : "w-0"}`} />
        </MotionLink>

        <motion.a
          href={sectionHref("#committees")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("community")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-50 text-3xl lg:hidden ${variant === "light" ? "text-foreground" : "text-[var(--white)]"}`}
        aria-label={isOpen ? tCommon("menu.close") : tCommon("menu.open")}
        aria-expanded={isOpen}
      >
        {isOpen ? <IoIosClose /> : <IoMenu />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute end-0 top-full z-40 mt-2 flex w-56 flex-col gap-5 rounded-2xl bg-surface px-6 py-6 text-foreground shadow-lg backdrop-blur-md lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#home")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("home")}</span>
            </motion.a>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#about")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("about")}</span>
            </motion.a>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#projects")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("projects")}</span>
            </motion.a>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#events")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("events")}</span>
            </motion.a>

            <MotionLink
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href="/announcements"
              aria-current={isAnnouncementsActive ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium leading-none hover:underline ${isAnnouncementsActive ? "underline" : ""}`}
            >
              <span dir={dir}>{t("announcements")}</span>
            </MotionLink>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#committees")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("community")}</span>
            </motion.a>

            <LanguageSwitcher className="mt-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
