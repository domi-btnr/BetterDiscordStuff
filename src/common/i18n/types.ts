import type { ReactElement } from "react";

/** A plugin's messages for one language. Values are strings or nested groups, plurals use `_one`/`_other`/… suffixes. */
export interface Resource {
    [key: string]: string | Resource;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

type PluralSuffix = "zero" | "one" | "two" | "few" | "many" | "other";

type StripPlural<K extends string> = K extends `${infer Base}_${PluralSuffix}` ? Base | K : K;

/** Every key of `R` in dot notation (`"panel.title"`), plurals also by their base key (`"revoked"` for `"revoked_one"`). */
export type TranslationKey<R> = {
    [K in keyof R & string]: R[K] extends string ? StripPlural<K> : `${K}.${TranslationKey<R[K]>}`;
}[keyof R & string];

export interface TOptions {
    /** Picks the plural form (`key_one`, `key_other`, …) and fills `{{count}}`. */
    count?: number;
    /** Returned when the key is missing in every language. */
    defaultValue?: string;
    [value: string]: unknown;
}

export interface InitOptions<R extends Resource> {
    /** Messages by language. `en` is the fallback, other languages may leave out keys. */
    resources: { en: R } & Record<string, DeepPartial<R>>;
    /**
     * Keys that use one of Discord's own messages (by hashed key, e.g. `"Mdk9+A"` for "Copy") when it's loaded,
     * so they match Discord in every language. `resources` stay the fallback.
     */
    discord?: Partial<Record<TranslationKey<R>, string>>;
}

export interface TransProps<Key extends string> extends TOptions {
    i18nKey: Key;
    /** `{{placeholder}}` values. */
    values?: Record<string, unknown>;
    /** Elements for the message's tags: `<name>text</name>` passes `text` as children, `<name/>` renders as is. */
    components?: Record<string, ReactElement<any>>;
}
