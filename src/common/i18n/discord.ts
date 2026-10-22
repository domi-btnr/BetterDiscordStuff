import { Webpack } from "@api";
import type { LocaleStore } from "@vencord/discord-types";
import type { ReactNode } from "react";

import { I18nModule } from "../Webpack";

/**
 * Gets one of Discord's localized strings in the current locale, as plain text.
 * @param key The hashed message key (e.g. `"d3+iYs"`).
 * @returns The string, or `undefined` if the message or Discord's i18n module is missing.
 */
export function getLocalizedString(key: string): string | undefined;
/**
 * Gets one of Discord's localized strings in the current locale, with its placeholders filled in.
 * @param key The hashed message key (e.g. `"BR7Tno"`).
 * @param values Values for the message's placeholders.
 * @returns The formatted message, or `undefined` if the message or Discord's i18n module is missing.
 */
export function getLocalizedString(key: string, values: Record<string, unknown>): ReactNode[] | undefined;
export function getLocalizedString(key: string, values?: Record<string, unknown>): string | ReactNode[] | undefined {
    if (!values) return I18nModule.intl?.formatToPlainString(I18nModule.t[key]) ?? undefined;
    return I18nModule.intl?.format(I18nModule.t[key], values) ?? undefined;
}

/** @returns The locale Discord is currently displayed in (e.g. `"en-US"`). */
export function getLocale(): string {
    return (Webpack.getStore("LocaleStore") as unknown as LocaleStore).locale;
}
