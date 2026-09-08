import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import clsx from "clsx";
import { colors } from "@/src/constants/theme";

type AuthFieldProps = {
  label: string;
  error?: string | null;
  helper?: string;
} & TextInputProps;

const AuthField = ({ label, error, helper, secureTextEntry, className, ...inputProps }: AuthFieldProps) => {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const showToggle = Boolean(secureTextEntry);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className={clsx("auth-input-wrap", error && "auth-input-error")}>
        <TextInput
          className={clsx("auth-input", showToggle && "auth-input-secure", className)}
          placeholderTextColor={colors.mutedForeground}
          {...inputProps}
          secureTextEntry={hidden}
        />
        {showToggle && (
          <Pressable onPress={() => setHidden((current) => !current)} hitSlop={8}>
            <Text className="auth-input-toggle">{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        )}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : helper ? <Text className="auth-helper">{helper}</Text> : null}
    </View>
  );
};

export default AuthField;
