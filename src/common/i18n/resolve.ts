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

/** @returns One of Discord's messages as plain text, or `undefined` if it's missing or not loaded yet. */
function getDiscordMessage(key: string, values: TOptions): string | undefined {
    const message = I18nModule.t?.[key];
    if (!message) return;
    return I18nModule.intl?.formatToPlainString(message, values) || undefined;
}

/**
 * @param discordKey One of Discord's hashed message keys to try first, see `InitOptions.discord`.
 * @returns The raw message for `key`, picking the plural form by `options.count`, or `options.defaultValue`.
 */
export function resolveMessage(
    resources: Record<string, Resource>,
    key: string,
    options: TOptions = {},
    discordKey?: string
): string | undefined {
    const discordMessage = discordKey && getDiscordMessage(discordKey, options);
    if (discordMessage) return discordMessage;

    for (const language of getLanguages(resources)) {
        const resource = resources[language];
        if (options.count != null) {
            const rule = getPluralRules(language).select(options.count);
            const plural =
                (options.count === 0 ? getPath(resource, `${key}_zero`) : undefined)
                ?? getPath(resource, `${key}_${rule}`)
                ?? getPath(resource, `${key}_other`);
            if (plural != null) return plural;
        }
        const message = getPath(resource, key);
        if (message != null) return message;
    }
    return options.defaultValue;
}

/** Fills `{{placeholder}}`s from `values`, leaving unknown ones as they are. */
export function interpolate(message: string, values: Record<string, unknown>): string {
    return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (name in values ? String(values[name]) : match));
}
