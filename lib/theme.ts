"use client";

// The site's single theme mechanism: `localStorage.theme` ("light" | "dark") mirrored
// on <html data-theme>. With neither set, CSS follows the operating system
// (`html:not([data-theme])` + prefers-color-scheme). Every theme control goes through
// these helpers so they stay in sync with each other.

export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "gdg-theme-change";

export function readThemeChoice(): ThemeChoice {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

/** The theme actually shown: the saved choice, or the OS preference for "system". */
export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeChoice(choice: ThemeChoice): void {
  try {
    if (choice === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  if (choice === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Notifies on changes from any theme control, another tab, or the OS setting. */
export function subscribeToTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media.removeEventListener("change", onChange);
  };
}
