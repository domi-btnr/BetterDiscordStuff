import { createI18n } from "./createI18n";
import { getLocale, getLocalizedString } from "./discord";
import { getCurrentLocale, onLocaleChange, useLocale } from "./locale";

export * from "./createI18n";
export * from "./discord";
export { getCurrentLocale, onLocaleChange, useLocale } from "./locale";
export type * from "./types";

const I18n = { getLocalizedString, getLocale, getCurrentLocale, onLocaleChange, useLocale, createI18n };

export default I18n;
