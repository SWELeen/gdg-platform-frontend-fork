"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import AuthCard from "@/app/components/auth/AuthCard";

function VerificationResult() {
  const t = useTranslations("auth.verificationEmail");
  const params = useSearchParams();
  const failed = params.has("error");
  return <AuthCard size="sm" title={failed ? t("failedTitle") : t("completeTitle")}>
    <div className="mt-6 space-y-5 text-center">
      <p role="status" className="text-sm text-foreground/70">{failed ? t("failed") : t("complete")}</p>
      <Link href={failed ? "/signup/verify" : "/login"} className="block rounded-md bg-blue px-5 py-3 text-white">{failed ? t("resend") : t("login")}</Link>
    </div>
  </AuthCard>;
}
export default function VerifyEmailPage() { return <Suspense><VerificationResult /></Suspense>; }
