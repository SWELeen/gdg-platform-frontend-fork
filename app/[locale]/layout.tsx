import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localeMetadata } from "@/i18n/locale-metadata";
import "../globals.css";

// Google Sans isn't published on Google Fonts (Google keeps it proprietary); Roboto is the closest available match.
const googleSans = Roboto({
  variable: "--font-google-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "GDG on Campus | University of Jeddah",
  description: "Google Developer Group on Campus at the University of Jeddah.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      // Arabic mirrors the whole layout; use logical classes (ms-/pe-/start-/end-) so components flip with it.
      dir={localeMetadata[locale].dir}
      className={`${googleSans.variable} ${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-screen w-full flex flex-col items-stretch">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
