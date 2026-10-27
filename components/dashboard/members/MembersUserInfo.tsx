import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { useMemberWorkspace } from "./MemberWorkspaceContext";

export function MembersUserInfo(): ReactElement {
  const t = useTranslations("dashboard.committeeSwitcher");
  const { user, committees, selectedCommittee, selectCommittee } = useMemberWorkspace();

  return (
    <div className="order-1 flex items-center gap-2.5 lg:order-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-avatar-bg text-sm font-semibold text-foreground">
        {user.initials}
      </span>
      <div className="leading-tight">
        <p className="hidden text-sm font-semibold text-foreground sm:block">{user.name}</p>
        {committees.length > 1 ? (
          // Members in several committees switch which committee's tasks they see.
          <select
            value={selectedCommittee ?? ""}
            onChange={(event) => selectCommittee(event.target.value)}
            aria-label={t("label")}
            className="mt-0.5 max-w-48 cursor-pointer rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs text-foreground outline-none focus:border-blue-500"
          >
            {committees.map((committee) => (
              <option key={committee.code} value={committee.code}>
                {committee.name} · {committee.position}
              </option>
            ))}
          </select>
        ) : (
          <p className="hidden text-xs text-muted sm:block">
            {user.role} &middot; {user.membership}
          </p>
        )}
      </div>
    </div>
  );
}
