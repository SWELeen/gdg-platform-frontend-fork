"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeMetadata } from "@/i18n/locale-metadata";
import type { Locale } from "@/i18n/routing";

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const t = useTranslations("common.language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const nextLocale: Locale = locale === "en" ? "ar" : "en";

  const handleClick = () => {
    startTransition(() => {
      // next-intl's pathname is locale-free and already includes concrete dynamic segments.
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={t("switchTo", { language: localeMetadata[nextLocale].label })}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border-current/30 px-3 text-sm font-medium leading-none transition-colors hover:bg-current/3 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span>{localeMetadata[nextLocale].label}</span>
    </button>
  );
}
