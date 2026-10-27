import { useTranslations } from "next-intl";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function RegistrationsLink() {
  const t = useTranslations("profile");

  return (
    <Link
      href="/registrations"
      className="group flex w-full items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:border-[#4285f4]/50 hover:shadow-md dark:border-[#243b64]/70 dark:bg-surface sm:px-6"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#325fa6] dark:bg-[#243b64] dark:text-[#8ab4f8]">
        <CalendarDays className="size-6" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1 text-start text-base font-semibold text-[#243b64] dark:text-white">
        {t("registrationsLink")}
      </span>

      <ChevronRight
        className="size-5 shrink-0 text-[#325fa6] transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-[#8ab4f8]"
        aria-hidden="true"
      />
    </Link>
  );
}
