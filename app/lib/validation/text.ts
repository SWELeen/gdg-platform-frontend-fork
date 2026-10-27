export const TEXT_MAX_LENGTH = 255

// Returns "<field>Required" / "<field>TooLong" keys from messages/*/validation.json, or "" when valid.
export function validateRequiredText(
  value: string,
  field: "fullName" | "university"
) {
  const trimmed = value.trim()

  if (!trimmed) {
    return `${field}Required`
  }

  if (trimmed.length > TEXT_MAX_LENGTH) {
    return `${field}TooLong`
  }

  return ""
}
