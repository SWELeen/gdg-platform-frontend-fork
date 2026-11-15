"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import AuthCard from "@/app/components/auth/AuthCard";
import { apiRequest, API_ENABLED } from "@/lib/api/client";
import { storeAuthSession } from "@/lib/auth/session";
import { dashboardPathFor, type AuthenticatedIdentity } from "@/lib/auth/dashboard-route";

type GoogleSessionResult = {
  nextStep: "SIGNED_IN" | "COMPLETE_PROFILE";
  profile?: { email: string; fullName: string };
};

export default function GoogleAuthCallbackPage() {
  const t = useTranslations("auth.login.emailStep");
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeSignIn = async () => {
      if (!API_ENABLED) {
        setError(t("googleApiRequired"));
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.has("error")) {
        setError(t("googleAuthFailed"));
        return;
      }
      try {
        const result = await apiRequest<GoogleSessionResult>("/account/profile-status");
        if (!result.ok) {
          if (result.code === "GOOGLE_ACCOUNT_LINK_REQUIRED") {
            setError(t("googleAccountLinkRequired"));
          } else {
            setError(t("googleAuthFailed"));
          }
          return;
        }

        if (result.data.nextStep === "COMPLETE_PROFILE" && result.data.profile) {
          window.sessionStorage.setItem("gdg.google-signup-profile", JSON.stringify({
            ...result.data.profile,
          }));
          router.replace("/signup/complete");
          return;
        }

        storeAuthSession({ authenticated: true });
        const identity = await apiRequest<AuthenticatedIdentity>("/me");
        router.replace(identity.ok ? dashboardPathFor(identity.data) : "/login");
      } catch {
        setError(t("googleAuthFailed"));
      }
    };

    void completeSignIn();
  }, [router, t]);

  return (
    <AuthCard size="md" compact title={error ? t("googleErrorTitle") : t("googleLoading")}>
      {error ? (
        <div className="mt-4 w-full text-center">
          <p role="alert" className="text-sm text-gdg-red">{error}</p>
          <button type="button" onClick={() => router.replace("/login")} className="mt-5 text-sm font-medium text-blue hover:underline">
            {t("googleBackToLogin")}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground/65">{t("googleLoading")}</p>
      )}
    </AuthCard>
  );
}
