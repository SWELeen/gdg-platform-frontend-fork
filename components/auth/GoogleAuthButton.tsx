"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/better-auth-client";

export default function GoogleAuthButton({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("auth.login.emailStep");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const startGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const { error: authError } = await authClient.signIn.social({
        provider: "google",
        additionalData: { locale: locale === "ar" ? "ar" : "en" },
        callbackURL: `${window.location.origin}/${locale}/auth/callback`,
        errorCallbackURL: `${window.location.origin}/${locale}/auth/callback?error=oauth`,
      });
      if (authError) throw authError;
    } catch {
      setError(t("googleAuthFailed"));
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={startGoogleSignIn}
        disabled={isLoading}
        className="flex h-8.75 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] border border-foreground/15 text-sm font-medium text-foreground/65 transition-colors duration-200 hover:bg-blue/10 active:bg-blue/20 disabled:cursor-wait disabled:opacity-60"
      >
        <Image src="/google-logo.svg" alt={t("googleLogoAlt")} width={15} height={15} />
        {isLoading ? t("googleLoading") : t("google")}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-gdg-red">{error}</p>}
    </div>
  );
}
