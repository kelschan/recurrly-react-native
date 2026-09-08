import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

// Configuration loaded from app.config.js extras via expo-constants.
// POSTHOG_PROJECT_TOKEN and POSTHOG_HOST are read from .env at build time.
const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const host = (Constants.expoConfig?.extra?.posthogHost as string) || 'https://us.i.posthog.com';
const isPostHogConfigured = Boolean(projectToken && projectToken !== 'phc_your_project_token_here');

if (__DEV__ && !isPostHogConfigured) {
  console.warn(
    'POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, ' +
      'this causes events to be silently missed. ' +
      'This error stops appearing once POSTHOG_PROJECT_TOKEN is configured',
  );
}

/**
 * PostHog client instance for the Recurly Expo app.
 *
 * Configured via app.config.js extras read through expo-constants.
 * Required peer dependency react-native-svg is installed alongside posthog-react-native.
 *
 * @see https://posthog.com/docs/libraries/react-native
 */
export const posthog = new PostHog(projectToken ?? 'placeholder_key', {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  debug: __DEV__,
  flushAt: 20,
  flushInterval: 10000,
});

export const isPostHogEnabled = isPostHogConfigured;
