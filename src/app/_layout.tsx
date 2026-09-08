import { SplashScreen, Stack } from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect} from "react";

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

  useEffect(() => {
    if(fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  /* useEffect list watches for change to fontsLoaded and calls the function to hide the splash screen to reveal the app if the fonts load (so that unstyled fonts don't flash*/

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
