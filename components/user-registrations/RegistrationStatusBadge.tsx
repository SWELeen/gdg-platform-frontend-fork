import { useTranslations } from "next-intl";
import type { UserRegistrationStatus } from "@/lib/user-registrations/types";

const statusClasses: Record<UserRegistrationStatus, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  "need-confirmation": "border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-300",
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  declined: "border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300",
  attended: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  "not-attended": "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  cancelled: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export function RegistrationStatusBadge({
  status,
}: {
  status: UserRegistrationStatus;
}) {
  const t = useTranslations("userRegistrations.status");

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none ${statusClasses[status]}`}
    >
      {t(status)}
    </span>
  );
}
