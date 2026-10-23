import type * as Sentry from "@sentry/browser";

/** Discord's bundled `@sentry/browser`. Keep the devDependency on the same version as Discord's (`DiscordSentry.SDK_VERSION`). */
export type DiscordSentryType = typeof Sentry;
