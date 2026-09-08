import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignUp } from "@clerk/expo";
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
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from "@/lib/auth";

const SignUp = () => {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const posthog = usePostHog();
  const [firstName, setFirstName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [localErrors, setLocalErrors] = useState<{
    firstName?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    code?: string | null;
    form?: string | null;
  }>({});
  const isFetching = fetchStatus === "fetching";
  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const submitAccount = async () => {
    const nextErrors = {
      firstName: validateName(firstName),
      email: validateEmail(emailAddress),
      password: validatePassword(password, { isNew: true }),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
      form: null,
    };
    setLocalErrors(nextErrors);
    if (nextErrors.firstName || nextErrors.email || nextErrors.password || nextErrors.confirmPassword) return;

    const { error } = await signUp.password({
      firstName: firstName.trim(),
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) {
      setLocalErrors({ form: getClerkErrorMessage(error) });
      return;
    }

    if (signUp.status === "complete") {
      const finalizeError = await finalizeAndEnterApp((params) => signUp.finalize(params), router);
      if (finalizeError) setLocalErrors({ form: finalizeError });
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) setLocalErrors({ form: getClerkErrorMessage(sendError) });
  };

  const submitVerification = async () => {
    const codeError = validateVerificationCode(code);
    setLocalErrors({ code: codeError, form: null });
    if (codeError) return;

    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) {
      setLocalErrors({ form: getClerkErrorMessage(error) });
      return;
    }

    if (signUp.status === "complete") {
      // Identify the newly registered user — use stable Clerk user ID, set name as person property
      const userId = signUp.createdUserId;
      if (userId) {
        posthog.identify(userId, {
          $set: { first_name: signUp.firstName ?? undefined },
        });
      }
      posthog.capture('user_signed_up', {
        has_first_name: Boolean(signUp.firstName),
      });
      const finalizeError = await finalizeAndEnterApp((params) => signUp.finalize(params), router);
      if (finalizeError) setLocalErrors({ form: finalizeError });
    }
  };

  const resendCode = async () => {
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) setLocalErrors({ form: getClerkErrorMessage(error) });
  };

  const startOver = async () => {
    await signUp.reset();
    setCode("");
    setLocalErrors({});
  };

  return (
    <AuthScreen>
      <AuthBrand
        title={needsVerification ? "Check your email" : "Create your account"}
        subtitle={
          needsVerification
            ? `Enter the 6-digit code we sent to ${signUp.emailAddress ?? "your email"}.`
            : "Start tracking subscriptions in one calm, trusted place."
        }
      />

      <View className="auth-card">
        <View className="auth-form">
          {needsVerification ? (
            <>
              <AuthField
                label="Verification code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter the 6-digit code"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                error={localErrors.code ?? getClerkFieldMessage(errors.fields.code)}
              />
              <AuthButton label="Verify email" onPress={submitVerification} loading={isFetching} />
              <Pressable onPress={resendCode} disabled={isFetching} className="auth-secondary-button">
                <Text className="auth-secondary-button-text">I need a new code</Text>
              </Pressable>
              <Pressable onPress={startOver} disabled={isFetching}>
                <Text className="auth-helper text-center">Use a different email</Text>
              </Pressable>
            </>
          ) : (
            <>
              <AuthField
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
                textContentType="givenName"
                autoComplete="given-name"
                error={localErrors.firstName ?? getClerkFieldMessage(errors.fields.firstName)}
              />
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
                error={localErrors.email ?? getClerkFieldMessage(errors.fields.emailAddress)}
              />
              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
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
                placeholder="Re-enter your password"
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                error={localErrors.confirmPassword}
              />
              <AuthButton label="Create account" onPress={submitAccount} loading={isFetching} />
            </>
          )}

          {(localErrors.form || getClerkGlobalMessage(errors) || getClerkFieldMessage(errors.fields.captcha)) && (
            <Text className="auth-error">
              {localErrors.form ?? getClerkGlobalMessage(errors) ?? getClerkFieldMessage(errors.fields.captcha)}
            </Text>
          )}
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="auth-link">Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View nativeID="clerk-captcha" />
      <Text className="auth-trust">By creating an account, you can securely track renewals and spending in Recurly.</Text>
    </AuthScreen>
  );
};

export default SignUp;
