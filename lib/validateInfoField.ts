const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Saudi mobile numbers: 9 digits after the fixed +966 prefix, starting with 5.
const PHONE_PATTERN = /^5\d{8}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]{1,}$/u;

// Returns a key from messages/*/validation.json, or null when valid.
export function validateInfoField(key: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "fieldRequired";

  switch (key) {
    case "fullName":
      return NAME_PATTERN.test(trimmed) ? null : "profileNameInvalid";
    case "email":
      return EMAIL_PATTERN.test(trimmed) ? null : "profileEmailInvalid";
    case "phone":
      return PHONE_PATTERN.test(trimmed) ? null : "profilePhoneInvalid";
    default:
      return null;
  }
}
