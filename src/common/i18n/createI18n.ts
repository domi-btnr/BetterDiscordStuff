import type { ReactNode } from "react";

import { useLocale } from "./locale";
import { getLanguages, interpolate, resolveMessage } from "./resolve";
import { renderTags } from "./trans";
import type { InitOptions, Resource, TOptions, TranslationKey, TransProps } from "./types";

/**
 * Creates the translation API for a plugin's own messages, modeled after i18next/react-i18next.
 * The language follows Discord's (`"de"` for `"de-AT"`) and falls back to English for missing languages or keys.
 */
export function createI18n<R extends Resource>({ resources, discord = {} }: InitOptions<R>) {
    type Key = TranslationKey<R>;
    const allResources = resources as Record<string, Resource>;
    const discordKeys = discord as Record<string, string | undefined>;

    const resolve = (key: Key, options?: TOptions) => resolveMessage(allResources, key, options, discordKeys);

    /**
     * Translates `key` into Discord's current language.
     * @param options `{{placeholder}}` values, `count` for plurals and a `defaultValue`.
     * @returns The message, or the key itself if it's missing everywhere.
     */
    function t(key: Key, options: TOptions = {}): string {
        return interpolate(resolve(key, options) ?? key, options);
    }

    const i18n = {
        /** The language messages are currently picked from. */
        get language() {
            return getLanguages(allResources)[0];
        },
        /** Every language the plugin has messages for. */
        languages: Object.keys(resources),
        exists: (key: Key, options?: TOptions) => resolve(key, options) != null,
        t
    };

    /** @returns `t` and `i18n`, re-rendering the component when the user switches Discord's language. */
    function useTranslation() {
        useLocale();
        return { t, i18n, ready: true } as const;
    }

    /** Renders a message with React elements in it, e.g. `"Expires <time/>"` with `components={{ time: <Timestamp/> }}`. */
    function Trans({ i18nKey, values, components = {}, ...options }: TransProps<Key>): ReactNode {
        useLocale();
        const allValues = { ...options, ...values };
        const message = resolve(i18nKey, allValues) ?? i18nKey;
        return renderTags(message, components, text => interpolate(text, allValues));
    }

    return { i18n, t, useTranslation, Trans };
}
