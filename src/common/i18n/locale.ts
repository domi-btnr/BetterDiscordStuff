import { useSyncExternalStore } from "react";

import { I18nModule } from "../Webpack";

export const FALLBACK_LANGUAGE = "en";

/** @returns The locale Discord's messages are currently formatted in (e.g. `"de"`, `"en-US"`). */
export function getCurrentLocale(): string {
    return I18nModule.intl?.currentLocale ?? FALLBACK_LANGUAGE;
}

/**
 * Calls `callback` when the user switches Discord's language, after Discord's own messages have switched.
 * @returns A function that removes the listener.
 */
export function onLocaleChange(callback: (locale: string) => void): () => void {
    return I18nModule.intl?.onLocaleChange(callback) ?? (() => undefined);
}

/** @returns The current locale, re-rendering the component when the user switches Discord's language. */
export function useLocale(): string {
    return useSyncExternalStore(onLocaleChange, getCurrentLocale);
}
