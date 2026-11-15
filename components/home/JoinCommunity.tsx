"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { useRouter } from "@/i18n/navigation";

export default function JoinCommunity() {
  const t = useTranslations("home.joinCommunity");
  const dir = useTextDirection();
  const router = useRouter();

  return (
    <section className="mt-5 py-[clamp(1rem,1.5vw,1.5rem)]">
      <div
        className="relative mx-auto flex min-h-[clamp(15rem,20vw,22rem)] w-[60vw] items-center overflow-visible rounded-2xl px-[clamp(1.125rem,3vw,3.5rem)] py-[clamp(1.5rem,2vw,2.5rem)]"
        style={{
          background:
            "linear-gradient(to right, var(--join-blue), var(--join-orange), var(--join-green))",
        }}
      >
        <div className="relative z-10 max-w-[min(52rem,74%)] max-lg:max-w-full">
          <h3
            dir={dir}
            className="text-[clamp(1.3062rem,1.14rem_+_0.665vw,2.1375rem)] font-semibold leading-snug text-[var(--white)]"
          >
            {t("title")}
          </h3>

          <h4
            dir={dir}
            className="mt-3 max-w-[min(38rem,100%)] text-[clamp(0.9rem,0.855rem_+_0.3vw,1.2rem)] font-normal leading-normal text-[var(--white)]"
          >
            {t("description")}
          </h4>

          <motion.button
            type="button"
            onClick={() => router.push("/login")}
            className="relative mt-5 flex min-h-10 w-fit min-w-[min(13rem,100%)] cursor-pointer items-center justify-center overflow-hidden rounded-full border px-5 py-2.5 text-[clamp(0.875rem,0.85rem_+_0.2vw,1.05rem)] font-bold text-[var(--white)] backdrop-blur-md"
            style={{
              borderColor: "var(--glass-border)",
              backgroundColor: "var(--glass-background)",
              boxShadow:
                "inset 0 2px 8px var(--glass-highlight), inset 0 -4px 10px var(--glass-bottom), 0 4px 15px var(--glass-shadow)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10" dir={dir}>
              {t("cta")}
            </span>

            <span
              className="absolute inset-x-4 top-1 h-[12px] rounded-full blur-md"
              style={{
                backgroundColor: "var(--glass-shine)",
              }}
            />
          </motion.button>
        </div>

        <div className="absolute -end-[clamp(0.5rem,1.5vw,0.875rem)] -top-[clamp(4rem,6vw,6rem)] hidden w-[clamp(12rem,18vw,21rem)] lg:block">
          <img loading="lazy" decoding="async"
            src="/images/phone-image.png"
            width={1606} height={2352}
            alt={t("phoneAlt")}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
