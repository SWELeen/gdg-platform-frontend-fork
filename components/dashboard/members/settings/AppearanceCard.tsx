"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { applyThemeChoice, readThemeChoice, subscribeToTheme, type ThemeChoice } from "@/lib/theme";
import { SettingsCard } from "./SettingsCard";

const options: { value: ThemeChoice; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

/** Theme choice using the site's shared theme mechanism (same as the top bar toggle). */
export function AppearanceCard() {
  const t = useTranslations("dashboard.memberSettings.appearance");
  // Null while server rendering: the saved theme lives in the browser.
  const choice = useSyncExternalStore(subscribeToTheme, readThemeChoice, () => null);

  return (
    <SettingsCard
      id="member-appearance"
      icon={Palette}
      iconClassName="bg-gdg-pink-light text-gdg-dark"
      title={t("title")}
      description={t("description")}
    >
      <div role="radiogroup" aria-labelledby="member-appearance-title" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map(({ value, icon: Icon }) => {
          const selected = choice === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={choice === null}
              onClick={() => applyThemeChoice(value)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue disabled:opacity-60 ${
                selected
                  ? "border-gdg-blue bg-gdg-blue/5 text-foreground"
                  : "border-border text-foreground/80 hover:bg-surface-muted"
              }`}
            >
              <Icon className={`size-5 shrink-0 ${selected ? "text-gdg-blue" : "text-muted"}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t(`options.${value}.label`)}</span>
                <span className="block text-xs text-muted">{t(`options.${value}.description`)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}
