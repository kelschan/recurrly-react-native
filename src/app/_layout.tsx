import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen, Stack } from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect} from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    'sans-bold': require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    'sans-medium': require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    'sans-semibold': require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    'sans-extrabold': require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    'sans-light': require("@/assets/fonts/PlusJakartaSans-Light.ttf")
  })
  /* In the above, we're creating a dictionary, where the require () returns a boolean variable indicating if the font file has loaded or not */

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <AppContent fontsLoaded={fontsLoaded} />
    </ClerkProvider>
  );
}

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded: clerkLoaded } = useAuth();

  useEffect(() => {
    if (fontsLoaded && clerkLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, clerkLoaded]);

  if (!fontsLoaded || !clerkLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

  /* useEffect list watches for change to fontsLoaded and clerkLoaded and calls the function to hide the splash screen to reveal the app if the fonts load (so that unstyled fonts don't flash*/

