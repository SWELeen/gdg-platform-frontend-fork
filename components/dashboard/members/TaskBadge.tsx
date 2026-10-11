import type { ReactElement, ReactNode } from "react";

export function TaskBadge({ className, children }: { className: string; children: ReactNode }): ReactElement {
  return <span className={`inline-flex items-center text-xs font-medium ${className}`}>{children}</span>;
}
