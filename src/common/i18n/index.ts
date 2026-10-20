import { Webpack } from "@api";
import type { LocaleStore } from "@vencord/discord-types";
import type { ReactNode } from "react";

import { I18nModule } from "../Webpack";

export function getLocalizedString(key: string): string;
export function getLocalizedString(key: string, values: Record<string, unknown>): ReactNode[];
export function getLocalizedString(key: string, values?: Record<string, unknown>) {
    if (!values) return I18nModule.intl?.formatToPlainString(I18nModule.t[key]);
    return I18nModule.intl?.format(I18nModule.t[key], values);
}

export function getLocale(): string {
    return (Webpack.getStore("LocaleStore") as unknown as LocaleStore).locale;
}

const I18n = { getLocalizedString, getLocale };

export default I18n;
