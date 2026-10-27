import { NotificationPreferencesCard } from "./NotificationPreferencesCard";
import { ProfileCard } from "./ProfileCard";

/**
 * Member Settings: the member's own read-only profile and personal preferences.
 * Deliberately separate from the leader SettingsSection — no committee settings,
 * roles, approvals, or other administrative controls are reachable from here.
 */
export function MemberSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <ProfileCard />
      <NotificationPreferencesCard />
    </div>
  );
}
