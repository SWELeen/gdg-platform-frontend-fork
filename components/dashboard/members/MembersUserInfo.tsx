import type { ReactElement } from "react";

import type { DashboardUser } from "@/components/dashboard/mock-data";

export function MembersUserInfo({ user }: { user: DashboardUser }): ReactElement {
  return (
    <div className="order-1 flex items-center gap-2.5 lg:order-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-avatar-bg text-sm font-semibold text-foreground">
        {user.initials}
      </span>
      <div className="hidden leading-tight sm:block">
        <p className="text-sm font-semibold text-foreground">{user.name}</p>
        <p className="text-xs text-muted">
          {user.role} &middot; {user.membership}
        </p>
      </div>
    </div>
  );
}
