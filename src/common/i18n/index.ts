import { Webpack } from "@api";
import type { LocaleStore } from "@vencord/discord-types";
import type { ReactNode } from "react";

import { I18nModule } from "../Webpack";

/**
 * Gets one of Discord's localized strings in the current locale.
 * @param key The hashed message key (e.g. `"d3+iYs"`).
 * @param values Values for the message's placeholders. Without them, the message is returned as plain text.
 */
export function getLocalizedString(key: string): string;
export function getLocalizedString(key: string, values: Record<string, unknown>): ReactNode[];
export function getLocalizedString(key: string, values?: Record<string, unknown>) {
    if (!values) return I18nModule.intl?.formatToPlainString(I18nModule.t[key]);
    return I18nModule.intl?.format(I18nModule.t[key], values);
}

/** @returns The locale Discord is currently displayed in (e.g. `"en-US"`). */
export function getLocale(): string {
    return (Webpack.getStore("LocaleStore") as unknown as LocaleStore).locale;
}

const I18n = { getLocalizedString, getLocale };

export default I18n;
