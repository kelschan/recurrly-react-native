import { Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/expo";
import { usePostHog } from 'posthog-react-native';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const posthog = usePostHog();
  const displayName = user?.firstName || user?.fullName || "Recurly member";
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email on file";

  const handleSignOut = () => {
    posthog.capture('user_signed_out');
    posthog.reset();
    signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-5">Settings</Text>

      <View className="settings-card">
        <Text className="settings-kicker">Signed in</Text>
        <Text className="settings-name">{displayName}</Text>
        <Text className="settings-email">{email}</Text>
      </View>

      <Pressable onPress={handleSignOut} className="auth-button mt-6">
        <Text className="auth-button-text">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
