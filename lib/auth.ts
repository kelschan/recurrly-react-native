import type { Href } from "expo-router";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | null => {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
};

export const validatePassword = (value: string, { isNew = false } = {}): string | null => {
  if (!value) return isNew ? "Create a password." : "Enter your password.";
  if (value.length < 8) return "Use at least 8 characters.";
  return null;
};

export const validateName = (value: string): string | null => {
  const name = value.trim();
  if (!name) return "Enter your first name.";
  if (name.length < 2) return "Use at least 2 characters.";
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (!confirmation) return "Confirm your password.";
  if (password !== confirmation) return "Passwords do not match.";
  return null;
};

export const validateVerificationCode = (value: string): string | null => {
  const code = value.trim();
  if (!code) return "Enter the verification code.";
  if (!/^\d{6}$/.test(code)) return "Enter the 6-digit code from your email.";
  return null;
};

export const getClerkFieldMessage = (field?: { message?: string; longMessage?: string } | null) =>
  field?.longMessage ?? field?.message ?? null;

export const getClerkGlobalMessage = (errors?: { global?: { longMessage?: string; message?: string }[] | null } | null) =>
  errors?.global?.[0]?.longMessage ?? errors?.global?.[0]?.message ?? null;

export const getClerkErrorMessage = (error?: { longMessage?: string; message?: string; code?: string } | null) => {
  if (!error) return null;
  if (error.code === "form_identifier_not_found") {
    return "No Recurly account uses that email. Create an account to get started.";
  }
  if (error.code === "form_password_incorrect") {
    return "That password does not match this email.";
  }
  if (error.code === "form_password_pwned") {
    return "This password appears in a data breach. Reset it to keep your account safe.";
  }
  return error.longMessage ?? error.message ?? "Something went wrong. Try again.";
};

export const finalizeAndEnterApp = async (
  finalize: (params: {
    navigate: (args: { session: { currentTask?: { key?: string } | null } | null }) => void;
  }) => Promise<{ error: { longMessage?: string; message?: string } | null }>,
  router: { replace: (href: Href) => void },
) => {
  let pendingTaskKey: string | null = null;

  const { error } = await finalize({
    navigate: ({ session }) => {
      if (session?.currentTask?.key) {
        pendingTaskKey = session.currentTask.key;
        return;
      }
      router.replace("/(tabs)" as Href);
    },
  });

  if (error) return getClerkErrorMessage(error);
  if (pendingTaskKey) {
    return "Your account needs one more security step before Recurly can open. Try signing in again.";
  }
  return null;
};
