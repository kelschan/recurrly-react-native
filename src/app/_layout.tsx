import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect, useRef} from "react";
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/src/config/posthog';

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
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (fontsLoaded && clerkLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, clerkLoaded]);

  // Manual screen tracking for Expo Router
  // @see https://docs.expo.dev/router/reference/screen-tracking/
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded || !clerkLoaded) {
    return null;
  }

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false, // Manual tracking via posthog.screen() above
        captureTouches: true,
        propsToCapture: ['testID'],
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </PostHogProvider>
  );
}

  /* useEffect list watches for change to fontsLoaded and clerkLoaded and calls the function to hide the splash screen to reveal the app if the fonts load (so that unstyled fonts don't flash*/

