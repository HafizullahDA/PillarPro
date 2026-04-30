import type {
  SignInFormValues,
  SignInPayload,
  SignUpFormValues,
  SignUpPayload,
} from "@/features/auth/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  errors: Record<string, string>;
};

export function validateSignUpForm(
  values: SignUpFormValues,
): ValidationSuccess<SignUpPayload> | ValidationFailure {
  const fieldErrors: Record<string, string> = {};
  const name = values.name.trim();
  const email = values.email.trim().toLowerCase();
  const password = values.password;
  const confirmPassword = values.confirm_password;

  if (!name) {
    fieldErrors.name = "Name is required.";
  }

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    fieldErrors.confirm_password = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirm_password = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, errors: fieldErrors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      password,
    },
  };
}

export function validateSignInForm(
  values: SignInFormValues,
): ValidationSuccess<SignInPayload> | ValidationFailure {
  const fieldErrors: Record<string, string> = {};
  const email = values.email.trim().toLowerCase();
  const password = values.password;

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, errors: fieldErrors };
  }

  return {
    success: true,
    data: {
      email,
      password,
    },
  };
}

export function parseSignUpPayload(input: unknown): SignUpPayload {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateSignUpForm({
    name: String(object.name ?? ""),
    email: String(object.email ?? ""),
    password: String(object.password ?? ""),
    confirm_password: String(object.confirm_password ?? ""),
  });

  if (!result.success) {
    throw new AuthValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}

export function parseSignInPayload(input: unknown): SignInPayload {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateSignInForm({
    email: String(object.email ?? ""),
    password: String(object.password ?? ""),
  });

  if (!result.success) {
    throw new AuthValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}
