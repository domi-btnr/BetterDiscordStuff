import { I18nModule } from "../Webpack";
import { FALLBACK_LANGUAGE, getCurrentLocale } from "./locale";
import type { Resource, TOptions } from "./types";

const pluralRules = new Map<string, Intl.PluralRules>();

function getPluralRules(language: string) {
    let rules = pluralRules.get(language);
    if (!rules) pluralRules.set(language, (rules = new Intl.PluralRules(language)));
    return rules;
}

function getPath(resource: Resource | undefined, key: string): string | undefined {
    let value: string | Resource | undefined = resource;
    for (const part of key.split(".")) {
        if (typeof value !== "object") return;
        value = value[part];
    }
    return typeof value === "string" ? value : undefined;
}

/** @returns The languages to look messages up in, closest to Discord's first (`"en-GB"` → `["en-GB", "en"]`), skipping languages without messages. */
export function getLanguages(resources: Record<string, unknown>): string[] {
    const locale = getCurrentLocale();
    return [...new Set([locale, locale.split("-")[0], FALLBACK_LANGUAGE])].filter(language => language in resources);
}

/** @returns One of Discord's messages as plain text, or `undefined` if it's missing, not loaded yet or fails to format. */
function getDiscordMessage(key: string, values: TOptions): string | undefined {
    try {
        const message = I18nModule.t?.[key];
        if (!message) return;
        return I18nModule.intl?.formatToPlainString(message, values) || undefined;
    } catch {
        return undefined;
    }
}

/** @returns The plural keys to look `key` up by, most specific first, or none without a `count`. */
function getPluralKeys(key: string, count: number | undefined, language: string): string[] {
    if (count == null) return [];
    const forms = new Set([count === 0 ? "zero" : undefined, getPluralRules(language).select(count), "other"]);
    return [...forms].filter(Boolean).map(form => `${key}_${form}`);
}

/**
 * @param discordKeys Discord's hashed message keys to try first, see `InitOptions.discord`. With a `count`, only
 * the plural ones are used, so a missing Discord plural falls back to the plugin's own plural.
 * @returns The raw message for `key`, picking the plural form by `options.count`, or `options.defaultValue`.
 */
export function resolveMessage(
    resources: Record<string, Resource>,
    key: string,
    options: TOptions = {},
    discordKeys: Record<string, string | undefined> = {}
): string | undefined {
    const { count } = options;
    const discordCandidates = count == null ? [key] : getPluralKeys(key, count, getCurrentLocale());
    for (const candidate of discordCandidates) {
        const discordKey = discordKeys[candidate];
        const message = discordKey && getDiscordMessage(discordKey, options);
        if (message) return message;
    }

    for (const language of getLanguages(resources)) {
        for (const candidate of [...getPluralKeys(key, count, language), key]) {
            const message = getPath(resources[language], candidate);
            if (message != null) return message;
        }
    }
    return options.defaultValue;
}

/** Fills `{{placeholder}}`s from `values`, leaving unknown ones as they are. */
export function interpolate(message: string, values: Record<string, unknown>): string {
    return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (name in values ? String(values[name]) : match));
}
