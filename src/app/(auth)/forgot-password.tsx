import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { usePostHog } from 'posthog-react-native';
import AuthScreen from "@/src/components/auth/AuthScreen";
import AuthBrand from "@/src/components/auth/AuthBrand";
import AuthField from "@/src/components/auth/AuthField";
import AuthButton from "@/src/components/auth/AuthButton";
import {
  finalizeAndEnterApp,
  getClerkErrorMessage,
  getClerkFieldMessage,
  getClerkGlobalMessage,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from "@/lib/auth";

const ForgotPassword = () => {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const posthog = usePostHog();
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [localErrors, setLocalErrors] = useState<{
    email?: string | null;
    code?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    form?: string | null;
  }>({});
  const isFetching = fetchStatus === "fetching";
  const needsNewPassword = signIn.status === "needs_new_password";

  const sendCode = async () => {
    const emailError = validateEmail(emailAddress);
    setLocalErrors({ email: emailError, form: null });
    if (emailError) return;

    const { error: createError } = await signIn.create({ identifier: emailAddress.trim() });
    if (createError) {
      setLocalErrors({ form: getClerkErrorMessage(createError) });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setLocalErrors({ form: getClerkErrorMessage(error) });
      return;
    }

    setCodeSent(true);
    posthog.capture('password_reset_started');
  };

  const verifyCode = async () => {
    const codeError = validateVerificationCode(code);
    setLocalErrors({ code: codeError, form: null });
    if (codeError) return;

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
    if (error) setLocalErrors({ form: getClerkErrorMessage(error) });
  };

  const submitPassword = async () => {
    const nextErrors = {
      password: validatePassword(password, { isNew: true }),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
      form: null,
    };
    setLocalErrors(nextErrors);
    if (nextErrors.password || nextErrors.confirmPassword) return;

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) {
      setLocalErrors({ form: getClerkErrorMessage(error) });
      return;
    }

    if (signIn.status === "complete") {
      posthog.capture('password_reset_completed');
      const finalizeError = await finalizeAndEnterApp((params) => signIn.finalize(params), router);
      if (finalizeError) setLocalErrors({ form: finalizeError });
    }
  };

  const startOver = async () => {
    await signIn.reset();
    setCodeSent(false);
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setLocalErrors({});
  };

  return (
    <AuthScreen>
      <AuthBrand
        title={needsNewPassword ? "Choose a new password" : codeSent ? "Check your email" : "Reset your password"}
        subtitle={
          needsNewPassword
            ? "Pick a new password you have not used before."
            : codeSent
              ? `Enter the 6-digit reset code sent to ${emailAddress.trim()}.`
              : "We will email a reset code to the address on your Recurly account."
        }
      />

      <View className="auth-card">
        <View className="auth-form">
          {!codeSent && (
            <>
              <AuthField
                label="Email"
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="Enter your email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                error={localErrors.email ?? getClerkFieldMessage(errors.fields.identifier)}
              />
              <AuthButton label="Send reset code" onPress={sendCode} loading={isFetching} />
            </>
          )}

          {codeSent && !needsNewPassword && (
            <>
              <AuthField
                label="Reset code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter the 6-digit code"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                error={localErrors.code ?? getClerkFieldMessage(errors.fields.code)}
              />
              <AuthButton label="Verify code" onPress={verifyCode} loading={isFetching} />
              <Pressable onPress={sendCode} disabled={isFetching} className="auth-secondary-button">
                <Text className="auth-secondary-button-text">Send a new code</Text>
              </Pressable>
            </>
          )}

          {needsNewPassword && (
            <>
              <AuthField
                label="New password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a new password"
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                helper="Use at least 8 characters. A longer phrase is stronger."
                error={localErrors.password ?? getClerkFieldMessage(errors.fields.password)}
              />
              <AuthField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your new password"
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                error={localErrors.confirmPassword}
              />
              <AuthButton label="Save password and sign in" onPress={submitPassword} loading={isFetching} />
            </>
          )}

          {(localErrors.form || getClerkGlobalMessage(errors)) && (
            <Text className="auth-error">{localErrors.form ?? getClerkGlobalMessage(errors)}</Text>
          )}
        </View>

        <View className="auth-link-row">
          <Pressable onPress={startOver} disabled={isFetching}>
            <Text className="auth-link-copy">Start over</Text>
          </Pressable>
          <Text className="auth-link-copy">·</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="auth-link">Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthScreen>
  );
};

export default ForgotPassword;
