export interface DiscordErrorsType {
    /** Shows Discord's crash screen for `error` without reloading the client. */
    softCrash(error: Error): void;
}
