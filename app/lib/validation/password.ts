export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

type ValidatePasswordOptions = {
  emptyMessage?: string
}

// Shared across Login, Signup, and Reset Password; callers may override the
// empty-field message key since the existing forms word it differently.
export function validatePassword(
  value: string,
  { emptyMessage = "passwordRequired" }: ValidatePasswordOptions = {}
) {
  if (!value.trim()) {
    return emptyMessage
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return "passwordTooShort"
  }

  if (value.length > PASSWORD_MAX_LENGTH) {
    return "passwordTooLong"
  }

  return ""
}

type ValidateConfirmPasswordOptions = {
  emptyMessage?: string
}

// Shared across Signup and Reset Password; callers may override the
// empty-field message key since the existing forms word it differently.
export function validateConfirmPassword(
  value: string,
  password: string,
  {
    emptyMessage = "passwordConfirmRequired"
  }: ValidateConfirmPasswordOptions = {}
) {
  if (!value) {
    return emptyMessage
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return "passwordTooShort"
  }

  return value === password ? "" : "passwordMismatch"
}
