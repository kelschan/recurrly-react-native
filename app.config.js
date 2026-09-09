// app.config.js — extends app.json with PostHog runtime configuration.
// POSTHOG_PROJECT_TOKEN and POSTHOG_HOST are read from .env at build time.
const baseConfig = require('./app.json');

module.exports = {
  ...baseConfig.expo,
  extra: {
    ...(baseConfig.expo.extra ?? {}),
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
  },
};
