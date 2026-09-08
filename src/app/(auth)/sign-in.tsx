import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo";
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
  validateVerificationCode,
} from "@/lib/auth";

const SignIn = () => {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localErrors, setLocalErrors] = useState<{ email?: string | null; password?: string | null; code?: string | null; form?: string | null }>({});
  const isFetching = fetchStatus === "fetching";
  const needsVerification = signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor";

  const submitCredentials = async () => {
    const nextErrors = {
      email: validateEmail(emailAddress),
      password: validatePassword(password),
      form: null,
    };
    setLocalErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) {
      setLocalErrors({ form: getClerkErrorMessage(error) });
      return;
    }

    if (signIn.status === "complete") {
      const finalizeError = await finalizeAndEnterApp((params) => signIn.finalize(params), router);
      if (finalizeError) setLocalErrors({ form: finalizeError });
      return;
    }

    if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
      const emailFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === "email_code");
      if (emailFactor) {
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) setLocalErrors({ form: getClerkErrorMessage(sendError) });
        return;
      }
      setLocalErrors({ form: "This sign-in needs another verification step that Recurly does not support yet." });
    }
  };

  const submitVerification = async () => {
    const codeError = validateVerificationCode(code);
    setLocalErrors({ code: codeError, form: null });
    if (codeError) return;

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) {
      setLocalErrors({ form: getClerkErrorMessage(error) });
      return;
    }

    if (signIn.status === "complete") {
      const finalizeError = await finalizeAndEnterApp((params) => signIn.finalize(params), router);
      if (finalizeError) setLocalErrors({ form: finalizeError });
    }
  };

  const resendCode = async () => {
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) setLocalErrors({ form: getClerkErrorMessage(error) });
  };

  const startOver = async () => {
    await signIn.reset();
    setCode("");
    setLocalErrors({});
  };

  return (
    <AuthScreen>
      <AuthBrand
        title={needsVerification ? "Confirm it's you" : "Welcome back"}
        subtitle={
          needsVerification
            ? "We sent a 6-digit code to your email to protect this device."
            : "Sign in to continue managing your subscriptions"
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
              <AuthButton label="Verify and continue" onPress={submitVerification} loading={isFetching} />
              <Pressable onPress={resendCode} disabled={isFetching} className="auth-secondary-button">
                <Text className="auth-secondary-button-text">Send a new code</Text>
              </Pressable>
              <Pressable onPress={startOver} disabled={isFetching}>
                <Text className="auth-helper text-center">Use a different email</Text>
              </Pressable>
            </>
          ) : (
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
              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                error={localErrors.password ?? getClerkFieldMessage(errors.fields.password)}
              />
              <View className="auth-forgot-row">
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable>
                    <Text className="auth-link">Forgot password?</Text>
                  </Pressable>
                </Link>
              </View>
              <AuthButton label="Sign in" onPress={submitCredentials} loading={isFetching} />
            </>
          )}

          {(localErrors.form || getClerkGlobalMessage(errors)) && (
            <Text className="auth-error">{localErrors.form ?? getClerkGlobalMessage(errors)}</Text>
          )}
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurly?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="auth-link">Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <Text className="auth-trust">Your password is encrypted and never stored by Recurly.</Text>
    </AuthScreen>
  );
};

export default SignIn;
