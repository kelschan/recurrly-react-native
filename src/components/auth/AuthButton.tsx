import { ActivityIndicator, Pressable, Text } from "react-native";
import clsx from "clsx";
import { colors } from "@/src/constants/theme";

const AuthButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={clsx("auth-button", isDisabled && "auth-button-disabled")}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text className="auth-button-text">{label}</Text>
      )}
    </Pressable>
  );
};

export default AuthButton;
