// Shared constants for the Create Event flow (form, preview, and details page).

/** Attendee fields every registration collects, in display order (translation keys). */
export const registrantFieldKeys = [
  "fullName",
  "major",
  "phone",
  "email",
  "university",
] as const;

export type RegistrantFieldKey = (typeof registrantFieldKeys)[number];
export type RegistrantProfileKey = RegistrantFieldKey | "college" | "membership" | "committees";

/** Account fields exposed to the PR registration list when the backend supports a field selector.
 * University and membership are included in the account info UI but are returned by the backend
 * from the user's profile automatically, so they must not be sent in this selector.
 */
export const requiredRegistrantFields: string[] = [
  "Full name",
  "Major",
  "Phone number",
  "Email address",
];

/** Attendee details read from each account; additional event-specific details use custom questions. */
export const accountRegistrantFields: RegistrantFieldKey[] = ["fullName", "email", "phone", "major", "university"];

/** Stored value → translation key, so stored English values render in either locale. */
export const registrantFieldKeyByValue: Record<string, RegistrantProfileKey> = {
  "Full name": "fullName",
  College: "college",
  Major: "major",
  "Phone number": "phone",
  "Email address": "email",
  University: "university",
  "GDG on Campus membership": "membership",
  Committees: "committees",
};

export const questionTypes = [
  "short-answer",
  "long-answer",
  "multiple-choice",
  "single-choice",
  "checkboxes",
  "yes-no",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const questionTypeKeys: Record<string, string> = {
  "short-answer": "shortAnswer",
  "long-answer": "longAnswer",
  "multiple-choice": "multipleChoice",
  "single-choice": "singleChoice",
  checkboxes: "checkboxes",
  "yes-no": "yesNo",
};

export const choiceQuestionTypes: readonly string[] = ["single-choice", "multiple-choice", "checkboxes"];

export interface DraftQuestion {
  id: string;
  type: string;
  text: string;
  options?: string[];
  required: boolean;
}
