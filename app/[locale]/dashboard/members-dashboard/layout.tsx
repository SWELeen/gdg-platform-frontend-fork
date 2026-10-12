import type { ReactNode } from "react";
import { MembersLayoutClient } from "./MembersLayoutClient";

export default function MembersDashboardLayout({ children }: { children: ReactNode }) {
  return <MembersLayoutClient>{children}</MembersLayoutClient>;
}
