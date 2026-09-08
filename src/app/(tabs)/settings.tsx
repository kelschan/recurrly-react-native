import { Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const displayName = user?.firstName || user?.fullName || "Recurly member";
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email on file";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-5">Settings</Text>

      <View className="settings-card">
        <Text className="settings-kicker">Signed in</Text>
        <Text className="settings-name">{displayName}</Text>
        <Text className="settings-email">{email}</Text>
      </View>

      <Pressable onPress={() => signOut()} className="auth-button mt-6">
        <Text className="auth-button-text">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
