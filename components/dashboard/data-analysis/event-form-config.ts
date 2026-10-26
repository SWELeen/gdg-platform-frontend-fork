// Shared constants for the Create Event flow (form, preview, and details page).

/** Attendee fields every registration collects, in display order (translation keys). */
export const registrantFieldKeys = [
  "fullName",
  "universityId",
  "college",
  "major",
  "phone",
  "email",
  "membership",
] as const;

export type RegistrantFieldKey = (typeof registrantFieldKeys)[number];

/** Values stored on CommitteeEvent.requiredRegistrantFields (unchanged data shape). */
export const requiredRegistrantFields: string[] = [
  "Full name",
  "University ID",
  "College",
  "Major",
  "Phone number",
  "Email address",
  "GDG on Campus membership",
];

/** Stored value → translation key, so stored English values render in either locale. */
export const registrantFieldKeyByValue: Record<string, RegistrantFieldKey> = Object.fromEntries(
  requiredRegistrantFields.map((value, index) => [value, registrantFieldKeys[index]]),
);

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
