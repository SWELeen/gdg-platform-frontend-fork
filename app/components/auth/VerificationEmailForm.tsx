"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/better-auth-client";

export default function VerificationEmailForm() {
  const t = useTranslations("auth.verificationEmail");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function resend() {
    setBusy(true);
    setMessage("");
    try {
      const pending = JSON.parse(window.sessionStorage.getItem("gdg.pending-signup") ?? "{}") as { email?: string };
      if (!pending.email) { setMessage(t("missingEmail")); return; }
      const result = await authClient.sendVerificationEmail({ email: pending.email, callbackURL: `${window.location.origin}/${locale}/verify-email` });
      setMessage(result.error ? t("failed") : t("sent"));
    } catch { setMessage(t("failed")); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 space-y-5 text-center">
    <p className="text-sm text-foreground/70">{t("instructions")}</p>
    <button type="button" disabled={busy} onClick={resend} className="w-full rounded-md bg-blue px-5 py-3 text-white disabled:opacity-50">{busy ? t("sending") : t("resend")}</button>
    {message && <p role="status" className="text-sm">{message}</p>}
    <Link href="/login" className="block text-sm text-blue hover:underline">{t("login")}</Link>
  </div>;
}
