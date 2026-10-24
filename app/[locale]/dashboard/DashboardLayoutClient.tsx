"use client";

import { useState, type ReactNode } from "react";
import { LeaderDashboardProvider } from "@/components/dashboard/shared/LeaderDashboardContext";
import { TopNav } from "@/components/dashboard/TopNav";
import Footer from "@/components/Footer";
import { LeaderSidebar } from "@/components/dashboard/shared/LeaderSidebar";
import { LeaderHeader } from "@/components/dashboard/shared/LeaderHeader";
import { LeaderDashboardStatus } from "@/components/dashboard/shared/LeaderDashboardStatus";
import type { LeaderCommittee, LeaderDashboardSeed } from "@/components/dashboard/shared/types";
import { DashboardAccessGate } from "@/components/dashboard/shared/DashboardAccessGate";

function LeaderLayoutShell({
  children,
  committee,
  developerCommitteesLeader,
}: {
  children: ReactNode;
  committee: LeaderCommittee;
  developerCommitteesLeader: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      {/* Universal TopNav reused from Member Dashboard */}
      <TopNav />

      {/* Main Layout Row with Sidebar */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Sidebar */}
        <LeaderSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          committee={committee}
          developerCommitteesLeader={developerCommitteesLeader}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Section Header */}
          <LeaderHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            committee={committee}
            developerCommitteesLeader={developerCommitteesLeader}
          />

          {/* Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <LeaderDashboardStatus />
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Shared Platform Footer */}
      <Footer />
    </div>
  );
}

export function LeaderLayoutClient({
  children,
  committee = "data-analysis",
  seed,
  developerCommitteesLeader = false,
}: {
  children: ReactNode;
  committee?: LeaderCommittee;
  seed?: LeaderDashboardSeed;
  developerCommitteesLeader?: boolean;
}) {
  const requirement = developerCommitteesLeader
    ? { kind: "global-role" as const, roles: ["DEVELOPER_COMMITTEES_LEADER"] }
    : { kind: "committee-leader" as const, committee };
  return (
    <DashboardAccessGate requirement={requirement}>
      <LeaderDashboardProvider committee={committee} seed={seed} developerCommitteesLeader={developerCommitteesLeader}>
        <LeaderLayoutShell committee={committee} developerCommitteesLeader={developerCommitteesLeader}>{children}</LeaderLayoutShell>
      </LeaderDashboardProvider>
    </DashboardAccessGate>
  );
}
