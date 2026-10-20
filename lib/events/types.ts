import type { CommitteeEvent, LeaderCommittee } from "@/components/dashboard/shared/types";

/** A published platform event as members see it (no leader-only fields). */
export type PlatformEvent = Pick<
  CommitteeEvent,
  | "id"
  | "title"
  | "type"
  | "date"
  | "time"
  | "location"
  | "capacity"
  | "registered"
  | "description"
  | "speakers"
  | "mapsLink"
  | "registrationDeadline"
  | "requirements"
  | "imageUrl"
  | "registrationQuestions"
> & {
  committee: LeaderCommittee;
};
