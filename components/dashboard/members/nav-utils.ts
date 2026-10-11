import { useLocale } from "next-intl";
import { getPathname } from "@/i18n/navigation";

// Highlights whichever sidebar item matches the current route. The member dashboard uses an exact
// match since "/dashboard/members-dashboard" is the named route; every other item matches its
// own route or any nested route under it (e.g. "/events/123", "/events/create"). This stays
// correct regardless of whether Events/Tasks/Members/Achievements end up as top-level routes
// or nested under "/dashboard/members-dashboard" — only their `href` in mock-data.ts needs to change from the
// current placeholder ("#") to the real path once those pages exist; no logic change needed.
// `pathname` comes from @/i18n/navigation, so it has no locale prefix.
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/members-dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Adds the current locale to real routes; "#" placeholders pass through.
export function useLocalizedHref(): (href: string) => string {
  const locale = useLocale();
  return (href) => (href.startsWith("/") ? getPathname({ href, locale }) : href);
}
