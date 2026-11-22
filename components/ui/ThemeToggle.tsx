"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { applyThemeChoice, readThemeChoice, resolveTheme, subscribeToTheme, syncThemeCookie } from "@/lib/theme";

type Theme = "light" | "dark";

type ThemeToggleProps = {
  // For headers with a permanently dark background (dashboard/profile TopNav).
  // `text-foreground` is near-black in light mode, so the icon would vanish there.
  onDark?: boolean;
};

export default function ThemeToggle({ onDark = false }: ThemeToggleProps = {}) {
  const t = useTranslations("common.theme");
  const [theme, setTheme] = useState<Theme>("light");
  const transition = useRef<ViewTransition | null>(null);

  useEffect(() => {
    // Guarded read: browsers that block site storage would otherwise throw here.
    const savedTheme = readThemeChoice();

    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
    }
    syncThemeCookie(savedTheme);

    const frame = window.requestAnimationFrame(() => {
      setTheme(resolveTheme(savedTheme));
    });
    return () => {
      window.cancelAnimationFrame(frame);
      transition.current?.skipTransition();
    };
  }, []);

  // Stay in sync when the theme changes elsewhere (e.g. Member Settings → Appearance).
  useEffect(() => subscribeToTheme(() => setTheme(resolveTheme(readThemeChoice()))), []);

  const toggleTheme = async () => {
    if (transition.current) return;
    const root = document.documentElement;
    const visibleTheme = root.dataset.theme === "light" || root.dataset.theme === "dark"
      ? root.dataset.theme
      : resolveTheme(readThemeChoice());
    const nextTheme: Theme = visibleTheme === "light" ? "dark" : "light";
    const updateTheme = () => {
      flushSync(() => {
        applyThemeChoice(nextTheme);
        setTheme(nextTheme);
      });
    };

    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updateTheme();
      return;
    }

    root.dataset.themeTransition = "logo";
    try {
      const current = document.startViewTransition(updateTheme);
      transition.current = current;
      // A hidden tab or a skipped transition can reject ready without failing the update.
      void current.ready.catch(() => {});
      await current.finished;
    } catch {
      updateTheme();
    } finally {
      transition.current = null;
      delete root.dataset.themeTransition;
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? t("toDark")
          : t("toLight")
      }
      className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
        onDark ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface-muted"
      }`}
    >
      {theme === "light" ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3
               7 7 0 0 0 21 12.79Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
