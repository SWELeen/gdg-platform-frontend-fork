"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { MembersSidebar } from "@/components/dashboard/members/MembersSidebar";
import { MembersCompactNav } from "@/components/dashboard/members/MembersCompactNav";
import { MembersPageHeader } from "@/components/dashboard/members/MembersPageHeader";
import { usePathname } from "@/i18n/navigation";
import { DashboardAccessGate } from "@/components/dashboard/shared/DashboardAccessGate";
import { MemberWorkspaceProvider } from "@/components/dashboard/members/MemberWorkspaceContext";

const HOME_ROUTE = "/dashboard/members-dashboard";

export function MembersLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The home page renders its own compact nav in-place between its sections.
  const isHome = pathname.replace(/\/+$/, "") === HOME_ROUTE;

  return (
    <DashboardAccessGate requirement={{ kind: "member" }}>
    <MemberWorkspaceProvider>
    <div className="flex flex-col bg-surface text-foreground">
      <MotionConfig reducedMotion="user">
        {/* Header + sidebar/content fill at least the viewport, so the footer starts below the fold. */}
        <div className="flex min-h-screen flex-1 flex-col bg-surface text-foreground">
          <TopNav />
          <div className="flex flex-1 flex-col lg:flex-row">
            <MembersSidebar />
            <main className="min-w-0 flex-1 bg-surface-muted/40 px-[var(--page-gutter)] py-6 lg:py-8">
              <div key={pathname} className="dashboard-page-enter">
                {!isHome && (
                  <div className="pb-6">
                    <MembersPageHeader />
                  </div>
                )}
                {!isHome && (
                  <div className="pb-6 lg:hidden">
                    <MembersCompactNav />
                  </div>
                )}
                {children}
              </div>
            </main>
          </div>
        </div>
      </MotionConfig>
      <Footer />
    </div>
    </MemberWorkspaceProvider>
    </DashboardAccessGate>
  );
}
