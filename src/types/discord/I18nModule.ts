import type { ReactNode } from "react";

export interface IntlMessage {
    locale: string;
    ast: unknown[];
}

/**
 * An entry of `t`.
 * @param locale The locale to get the message for.
 * @returns The parsed message, or its raw text.
 */
export type IntlMessageGetter = (locale: string) => IntlMessage | string;

type IntlFormatter<R> = (message: IntlMessageGetter | null | undefined, values?: Record<string, unknown>) => R | null;

export interface IntlManager {
    currentLocale: string;
    defaultLocale: string;
    formatConfig: Record<
        "duration" | "list" | "relativeTime" | "number" | "date" | "time",
        Record<string, Record<string, unknown>>
    >;
    data: Record<
        | "formatDate"
        | "formatDuration"
        | "formatNumber"
        | "formatList"
        | "formatListToParts"
        | "formatRelativeTime"
        | "formatTime"
        | "getPluralRules",
        (...args: any[]) => any
    >;
    _forceLookupMatcher: boolean;
    _localeSubscriptions: Set<(locale: string) => void>;

    /**
     * Calls `callback` whenever the locale changes.
     * @returns A function that removes the listener.
     */
    onLocaleChange(callback: (locale: string) => void): () => void;
    format: IntlFormatter<ReactNode[]>;
    formatToPlainString: IntlFormatter<string>;
    formatToMarkdownString: IntlFormatter<string>;
    formatToParts: IntlFormatter<unknown[]>;

    withFormatters(formatters: Record<string, { format: (...args: any[]) => unknown; builder: unknown }>): this;
    makeFormatFunction(formatter: { format: (...args: any[]) => unknown; builder: unknown }): IntlFormatter<unknown>;
    setLocale(locale: string): void;
    emitLocaleChange(locale: string): void;
    /**
     * Gets the raw text of a message, with its placeholders unformatted.
     * @returns The message text, or an empty string if `message` is missing.
     */
    string(message: IntlMessageGetter | null | undefined): string;
    reserialize(message: IntlMessageGetter | null | undefined): string;
    bindFormatValues(builder: unknown, message: IntlMessage, values?: Record<string, unknown>): unknown;
}

export interface I18nModuleType {
    initialLocale: string;
    systemLocale: string;
    intl: IntlManager;
    /** Discord's messages, keyed by their hashed message key (e.g. `"d3+iYs"`). */
    t: Record<string, IntlMessageGetter>;
    international: Record<string, IntlMessageGetter>;
    getSystemLocale(fallback?: string): string;
    useSyncMessages(messages: unknown): unknown;
    getLanguages(): { code: string; name: string; enabled: boolean }[];
    getAvailableLocales(): { value: string; name: string; localizedName: string }[];
}
