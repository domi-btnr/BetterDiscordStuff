import type { DiscordErrorsType, DiscordNativeType, DiscordSentryType, DiscordVideoType } from "./discord";

declare global {
    const DiscordErrors: DiscordErrorsType;
    const DiscordNative: DiscordNativeType;
    const DiscordSentry: DiscordSentryType;
    const DiscordVideo: DiscordVideoType;
}
