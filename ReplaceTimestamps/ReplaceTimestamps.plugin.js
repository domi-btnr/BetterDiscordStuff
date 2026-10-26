/**
 * @name ReplaceTimestamps
 * @version 1.5.0
 * @description Replaces plaintext times and dates into Discord's timestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ReplaceTimestamps
 */

"use strict";

/* @manifest */
const manifest = {
    $schema: "../../common/Schemas/manifest.schema.json",
    name: "ReplaceTimestamps",
    version: "1.5.0",
    description: "Replaces plaintext times and dates into Discord's timestamps",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ReplaceTimestamps",
    changelog: {
        date: "2026-10-26",
        changes: [
            {
                type: "added",
                title: "What's new",
                items: [
                    "12-hour times work in more ways, like 5pm, 5 PM or 5:30 pm",
                    "More date formats: 2003-11-17, 1.2.2003, 17.11.03 and 17.11. for this year, which you can turn off",
                    'Relative times can combine units, like "in 1h 30m" or "2 days, 3 hours ago"',
                    "The new Timestamp Style setting shows converted times in Discord's long or relative style",
                    "Put a backslash in front of a time or date to keep it as typed, like \\05:30"
                ]
            },
            {
                type: "fixed",
                title: "More reliable dates",
                items: [
                    "Changing the date order now takes effect immediately, instead of mixing up day and month until you restart the plugin",
                    "Forum posts now get their times and dates converted too",
                    'Relative times stay exact when the clocks change, and "in 1 month" on January 31 now lands on the last day of February',
                    "Dates and times that don't exist, like 31.02.2003 or 25:00, are left as you typed them instead of rolling over into another date"
                ]
            },
            {
                type: "improved",
                title: "Rebuilt from the ground up",
                items: [
                    'Relative times work with spaces and full words too, like "in 20 min" or "3 days ago"',
                    "Times and dates inside code, links and mentions are now left as you typed them",
                    "The Date Format setting is now simply Date Order, day first or month first. Your current choice carries over",
                    "Rewrote the plugin from the ground up, making it lighter and less likely to break when Discord updates"
                ]
            }
        ]
    }
};

/* @api */
const { Components, Data, Hooks, Logger, Patcher, UI, Webpack } = new BdApi(manifest.name);

/* ../../common/Webpack/Dispatcher.ts */
const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", "_actionHandlers", {
    searchExports: true
});

/* ../../common/Webpack/Flux.ts */
const Flux = Webpack.getByKeys("Store");

/* ../../common/Webpack/lazy.ts */
function lazyExport(getter) {
    let resolved = false;
    let cached;
    const resolve = () => {
        if (!resolved) {
            cached = getter() || void 0;
            resolved = true;
        }
        return cached;
    };
    return new Proxy(
        {},
        {
            get: (_, key) => resolve()?.[key],
            set: (_, key, value) => {
                const target = resolve();
                if (!target) return false;
                target[key] = value;
                return true;
            },
            defineProperty: (_, key, descriptor) => {
                const target = resolve();
                return !!target && Reflect.defineProperty(target, key, descriptor);
            },
            deleteProperty: (_, key) => {
                const target = resolve();
                return !!target && Reflect.deleteProperty(target, key);
            },
            has: (_, key) => key in (resolve() ?? {}),
            ownKeys: () => Reflect.ownKeys(resolve() ?? {}),
            getOwnPropertyDescriptor: (_, key) => {
                const descriptor = Reflect.getOwnPropertyDescriptor(resolve() ?? {}, key);
                return descriptor && { ...descriptor, configurable: true };
            }
        }
    );
}

/* ../../common/Webpack/I18nModule.ts */
const I18nModule = lazyExport(() => Webpack.getModule(m => m.intl));

/* ../../common/Webpack/MessageActions.ts */
const MessageActions = Webpack.getByKeys("sendMessage", "editMessage");

/* ../../common/i18n/locale.ts */
const FALLBACK_LANGUAGE = "en";

function getCurrentLocale() {
    return I18nModule.intl?.currentLocale ?? FALLBACK_LANGUAGE;
}

function onLocaleChange(callback) {
    return I18nModule.intl?.onLocaleChange(callback) ?? (() => void 0);
}

function useLocale() {
    return BdApi.React.useSyncExternalStore(onLocaleChange, getCurrentLocale);
}

/* ../../common/i18n/resolve.ts */
const pluralRules = new Map();

function getPluralRules(language) {
    let rules = pluralRules.get(language);
    if (!rules) pluralRules.set(language, (rules = new Intl.PluralRules(language)));
    return rules;
}

function getPath(resource, key) {
    let value = resource;
    for (const part of key.split(".")) {
        if (typeof value !== "object") return;
        value = value[part];
    }
    return typeof value === "string" ? value : void 0;
}

function getLanguages(resources) {
    const locale = getCurrentLocale();
    return [...new Set([locale, locale.split("-")[0], FALLBACK_LANGUAGE])].filter(language => language in resources);
}

function getDiscordMessage(key, values) {
    try {
        const message = I18nModule.t?.[key];
        if (!message) return;
        return I18nModule.intl?.formatToPlainString(message, values) || void 0;
    } catch {
        return void 0;
    }
}

function getPluralKeys(key, count, language) {
    if (count == null) return [];
    const forms = new Set([count === 0 ? "zero" : void 0, getPluralRules(language).select(count), "other"]);
    return [...forms].filter(Boolean).map(form => `${key}_${form}`);
}

function resolveMessage(resources, key, options = {}, discordKeys = {}) {
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

function interpolate(message, values) {
    return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (name in values ? String(values[name]) : match));
}

/* ../../common/i18n/trans.ts */
const TAG_REGEX = /<(\w+)\s*\/>|<(\w+)>(.*?)<\/\2>/s;

function renderTags(message, components, fill) {
    const parts = message.split(TAG_REGEX);
    const children = [];
    for (let i = 0; i < parts.length; i += 4) {
        if (parts[i]) children.push(fill(parts[i]));
        const [selfClosing, tag, inner] = parts.slice(i + 1, i + 4);
        const component = components[selfClosing ?? tag];
        if (selfClosing)
            children.push(component ? BdApi.React.cloneElement(component, { key: i }) : `<${selfClosing}/>`);
        else if (tag)
            children.push(component ? BdApi.React.cloneElement(component, { key: i }, fill(inner)) : fill(inner));
    }
    return BdApi.React.createElement(BdApi.React.Fragment, null, ...children);
}

/* ../../common/i18n/createI18n.ts */
function createI18n({ resources, discord = {} }) {
    const allResources = resources;
    const discordKeys = discord;
    const resolve = (key, options) => resolveMessage(allResources, key, options, discordKeys);
    function t(key, options = {}) {
        return interpolate(resolve(key, options) ?? key, options);
    }
    const i18n = {
        /** The language messages are currently picked from. */
        get language() {
            return getLanguages(allResources)[0];
        },
        /** Every language the plugin has messages for. */
        languages: Object.keys(resources),
        exists: (key, options) => resolve(key, options) != null,
        t
    };
    function useTranslation() {
        useLocale();
        return { t, i18n, ready: true };
    }
    function Trans({ i18nKey, values, components = {}, ...options }) {
        useLocale();
        const allValues = { ...options, ...values };
        const message = resolve(i18nKey, allValues) ?? i18nKey;
        return renderTags(message, components, text => interpolate(text, allValues));
    }
    return { i18n, t, useTranslation, Trans };
}

/* ../../common/i18n/discord.ts */
function getLocale() {
    return Webpack.getStore("LocaleStore").locale;
}

/* ../../common/Changelog/footer.tsx */
const { Text: Text$1 } = Components;

function Footer({ manifest }) {
    if (!manifest.invite && !manifest.source) return null;
    let issuesUrl;
    if (manifest.source) {
        const url = new URL(manifest.source);
        const [, owner, repo] = url.pathname.split("/");
        url.pathname = `/${owner}/${repo}/issues`;
        issuesUrl = url.toString();
    }
    return BdApi.React.createElement(
        Text$1,
        null,
        "Need support?",
        " ",
        manifest.invite
            && BdApi.React.createElement(
                BdApi.React.Fragment,
                null,
                "Join the",
                " ",
                BdApi.React.createElement(
                    "a",
                    { onClick: () => UI.showInviteModal(manifest.invite), style: { textDecoration: "underline" } },
                    "Discord Server"
                ),
                manifest.source && " or "
            ),
        manifest.source
            && BdApi.React.createElement(
                BdApi.React.Fragment,
                null,
                "Check for Issues on",
                " ",
                BdApi.React.createElement(
                    "a",
                    { href: issuesUrl, target: "_blank", rel: "noreferrer", style: { textDecoration: "underline" } },
                    "GitHub"
                )
            )
    );
}

/* ../../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog) return;
    const { date, title, subtitle, ...changelog } = manifest.changelog;
    if (!changelog.changes?.length && !changelog.blurb && !changelog.video && !changelog.banner) return;
    const formatter = new Intl.DateTimeFormat(getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog,
        footer: BdApi.React.createElement(Footer, { manifest })
    });
    Data.save("lastVersion", manifest.version);
}

/* ../../common/ErrorBoundary/locales/de.json */
const title$1 = "Etwas ist schiefgelaufen";
const description$1 =
    "{{plugin}} konnte diesen Bereich nicht anzeigen. Versuche es erneut oder drück <keybind/>, um die Details in der Konsole zu sehen.";
const retry$1 = "Erneut versuchen";
const mini$1 = "Bei {{plugin}} ist ein Fehler aufgetreten";
const copy$1 = "Fehler kopieren";
const copied$1 = "Kopiert";

const keys$1 = {
    command: "Befehl",
    option: "Option"
};

const de = {
    title: title$1,
    description: description$1,
    retry: retry$1,
    mini: mini$1,
    copy: copy$1,
    copied: copied$1,
    keys: keys$1
};

/* ../../common/ErrorBoundary/locales/en.json */
const title = "Something went wrong";
const description =
    "{{plugin}} couldn't show this part. Try again, or press <keybind/> to open the console for details.";
const retry = "Try Again";
const mini = "{{plugin}} ran into an error";
const copy = "Copy Error";
const copied = "Copied";

const keys = {
    command: "Command",
    option: "Option"
};

const en = {
    title: title,
    description: description,
    retry: retry,
    mini: mini,
    copy: copy,
    copied: copied,
    keys: keys
};

/* ../../common/ErrorBoundary/style.scss */
const styles = {
    errorBoundary: "error-boundary",
    errorBoundaryActions: "error-boundary-actions",
    errorBoundaryContent: "error-boundary-content",
    errorBoundaryKeybind: "error-boundary-keybind",
    errorBoundarySymbol: "error-boundary-symbol",
    errorBoundaryDetails: "error-boundary-details",
    errorBoundaryMini: "error-boundary-mini"
};

/* ../../common/ErrorBoundary/index.tsx */
const { Button, ErrorBoundary: BdErrorBoundary, Text } = Components;

const { Trans, useTranslation } = createI18n({
    resources: { en, de },
    discord: {
        title: "+XstB0",
        retry: "TdQXA8",
        copied: "q30c5i"
    }
});

const STACK_FRAMES = 2;
const CONSOLE_KEYS = navigator.userAgent.includes("Mac")
    ? [{ label: "\u2318", name: "keys.command" }, { label: "\u2325", name: "keys.option" }, { label: "I" }]
    : [{ label: "Ctrl" }, { label: "Shift" }, { label: "I" }];

function getShortStack(error) {
    const lines = error.stack?.split("\n") ?? [];
    const frames = lines
        .filter(line => line.trimStart().startsWith("at "))
        .slice(0, STACK_FRAMES)
        .map(line => line.replace(/[^\s()]*\/([^/\s()]+:\d+:\d+)/g, "$1"));
    return [`${error.name}: ${error.message}`, ...frames].join("\n");
}

function copyToClipboard(text) {
    if (typeof DiscordNative !== "undefined") DiscordNative.clipboard.copy(text);
    else navigator.clipboard?.writeText(text);
}

const ErrorIcon = props =>
    BdApi.React.createElement(
        "svg",
        { "viewBox": "0 0 24 24", "width": "24", "height": "24", "aria-hidden": "true", ...props },
        BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "11", fill: "currentColor" }),
        BdApi.React.createElement("path", {
            d: "M12 6.5v7",
            stroke: "#fff",
            strokeWidth: "2.5",
            strokeLinecap: "round"
        }),
        BdApi.React.createElement("circle", { cx: "12", cy: "17.5", r: "1.5", fill: "#fff" })
    );

function Keybind({ keys }) {
    const { t } = useTranslation();
    return BdApi.React.createElement(
        "span",
        { className: styles.errorBoundaryKeybind },
        keys.map(({ label, name }) =>
            BdApi.React.createElement(
                "kbd",
                { key: label },
                name
                    ? BdApi.React.createElement(
                          "span",
                          { "className": styles.errorBoundarySymbol, "role": "img", "aria-label": t(name) },
                          label
                      )
                    : label
            )
        )
    );
}

function CopyErrorButton({ id, error }) {
    const { t } = useTranslation();
    const [copied, setCopied] = BdApi.React.useState(false);
    BdApi.React.useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 1e3);
        return () => clearTimeout(timeout);
    }, [copied]);
    const copy = () => {
        copyToClipboard(`${manifest.name} v${manifest.version} (${id})
${error.stack ?? getShortStack(error)}`);
        setCopied(true);
    };
    return BdApi.React.createElement(
        Button,
        { size: Button.Sizes.SMALL, color: copied ? Button.Colors.GREEN : Button.Colors.PRIMARY, onClick: copy },
        t(copied ? "copied" : "copy")
    );
}

function MiniFallback() {
    const { t } = useTranslation();
    const label = t("mini", { plugin: manifest.name });
    return BdApi.React.createElement(
        "span",
        { "className": styles.errorBoundaryMini, "role": "img", "aria-label": label, "title": label },
        BdApi.React.createElement(ErrorIcon, { width: "16", height: "16" })
    );
}

function Fallback({ id, error, onRetry }) {
    const { t } = useTranslation();
    return BdApi.React.createElement(
        "div",
        { className: styles.errorBoundary, role: "alert" },
        BdApi.React.createElement(
            "div",
            { className: styles.errorBoundaryContent },
            BdApi.React.createElement(
                Text,
                { size: Text.Sizes.SIZE_16, color: Text.Colors.HEADER_PRIMARY, strong: true },
                t("title")
            ),
            BdApi.React.createElement(
                Text,
                { color: Text.Colors.MUTED },
                BdApi.React.createElement(Trans, {
                    i18nKey: "description",
                    values: { plugin: manifest.name },
                    components: { keybind: BdApi.React.createElement(Keybind, { keys: CONSOLE_KEYS }) }
                })
            ),
            error
                && BdApi.React.createElement(
                    "code",
                    { className: styles.errorBoundaryDetails },
                    "[",
                    id,
                    "] ",
                    getShortStack(error)
                )
        ),
        BdApi.React.createElement(
            "div",
            { className: styles.errorBoundaryActions },
            error && BdApi.React.createElement(CopyErrorButton, { id, error }),
            BdApi.React.createElement(Button, { size: Button.Sizes.SMALL, onClick: onRetry }, t("retry"))
        )
    );
}

function ErrorBoundary({ id, mini, children }) {
    const [error, setError] = BdApi.React.useState(null);
    const [attempt, setAttempt] = BdApi.React.useState(0);
    const retry = () => {
        setError(null);
        setAttempt(attempt + 1);
    };
    return BdApi.React.createElement(
        BdErrorBoundary,
        {
            key: attempt,
            id,
            name: manifest.name,
            fallback: mini
                ? BdApi.React.createElement(MiniFallback, null)
                : BdApi.React.createElement(Fallback, { id, error, onRetry: retry }),
            onError: setError
        },
        children
    );
}

/* ../../common/Settings/store.ts */
const Settings = new (class Settings2 extends Flux.Store {
    constructor() {
        super(Dispatcher, {});
    }
    _settings = Data.load("SETTINGS") ?? {};
    get(key, def) {
        return this._settings[key] ?? def;
    }
    set(key, value) {
        this._settings[key] = value;
        Data.save("SETTINGS", this._settings);
        this.emitChange();
    }
})();

/* ../../common/Settings/items/shared.tsx */
function BetaTag() {
    return BdApi.React.createElement(
        "span",
        {
            style: {
                display: "inline-flex",
                alignItems: "center",
                height: 16,
                marginLeft: "var(--space-4)",
                padding: "0 var(--space-8)",
                borderRadius: "var(--radius-round)",
                background: "var(--badge-primary-background)",
                color: "var(--badge-primary-text)",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: "16px",
                textTransform: "uppercase"
            }
        },
        "Beta"
    );
}

function Warning({ children }) {
    return BdApi.React.createElement(
        "div",
        {
            style: {
                marginTop: 8,
                padding: "6px 10px",
                borderRadius: 4,
                border: "1px solid var(--border-feedback-warning)",
                background: "var(--background-feedback-warning)",
                color: "var(--text-default)",
                fontSize: 14,
                lineHeight: "18px"
            }
        },
        children
    );
}

function getItemLabels({ name, note, isBeta, warning }) {
    return {
        name: isBeta
            ? BdApi.React.createElement(BdApi.React.Fragment, null, name, BdApi.React.createElement(BetaTag, null))
            : name,
        note: warning
            ? BdApi.React.createElement(
                  BdApi.React.Fragment,
                  null,
                  note,
                  BdApi.React.createElement(Warning, null, warning)
              )
            : note
    };
}

/* ../../common/Settings/items/dropdown.tsx */
const { SettingItem: SettingItem$2 } = Components;

const Select = Webpack.getByStrings('selectionMode:"single",onSelectionChange:', "clear:()=>", {
    searchExports: true
});

function DropdownItem({ isBeta, warning, ...props }) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    const options = props.options.map(option =>
        typeof option === "string" ? { label: option, value: option } : option
    );
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: props.id },
        BdApi.React.createElement(
            SettingItem$2,
            { ...props, ...getItemLabels({ ...props, isBeta, warning }), inline: true },
            BdApi.React.createElement(
                "div",
                { style: { width: 200, flexShrink: 0 } },
                BdApi.React.createElement(Select, {
                    closeOnSelect: true,
                    options,
                    value,
                    onChange: v => Settings.set(props.id, v),
                    renderOptionLabel: option => option.label
                })
            )
        )
    );
}

/* ../../common/Settings/items/slider.tsx */
const { SettingItem: SettingItem$1 } = Components;
const Slider = Webpack.getByStrings("stickToMarkers", "moveStaggered", { searchExports: true });

function SliderItem({ isBeta, warning, ...props }) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value ?? props.defaultValue));
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: props.id },
        BdApi.React.createElement(
            SettingItem$1,
            { ...props, ...getItemLabels({ ...props, isBeta, warning }) },
            BdApi.React.createElement(Slider, {
                ...props,
                handleSize: 10,
                initialValue: value,
                defaultValue: props.defaultValue,
                minValue: props.minValue,
                maxValue: props.maxValue,
                onValueChange: value2 => Settings.set(props.id, Math.round(value2)),
                onValueRender: value2 => Math.round(value2)
            })
        )
    );
}

/* ../../common/Settings/items/switch.tsx */
const { SettingItem, SwitchInput } = Components;

function SwitchItem({ isBeta = false, disabled = false, warning, ...props }) {
    const stored = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    const value = disabled ? false : stored;
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: props.id },
        BdApi.React.createElement(
            SettingItem,
            { ...props, ...getItemLabels({ ...props, isBeta, warning }), inline: true },
            BdApi.React.createElement(SwitchInput, { value, disabled, onChange: v => Settings.set(props.id, v) })
        )
    );
}

/* ../../common/Settings/panel.tsx */
function SettingsPanel({ items, components: customComponents }) {
    const ComponentMap = {
        dropdown: DropdownItem,
        switch: SwitchItem,
        slider: SliderItem,
        ...customComponents
    };
    return items.map(item => {
        const Component = ComponentMap[item.type];
        return Component ? BdApi.React.createElement(Component, { key: item.id, ...item }) : null;
    });
}

/* modules/timestamps.ts */
const TIME = String.raw`(?<![\w.:])(?<hours>\d{1,2})(?::(?<minutes>\d{2})(?!\d|:\d))?(?:[ \t]?(?<meridiem>[aApP][mM])\b(?!(?<=[ \t]am)[ \t]+[A-ZÄÖÜ]))?(?<=:\d\d|[mM])`;
const DATE = String.raw`(?<![\w.])(?<date>\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{2}[./-]\d{2}[./-]\d{2}|\d{2}\.\d{2}\.)(?!\w|[./]\d)`;

const STYLES = {
    short: { time: "t", date: "d", dateTime: "s" },
    long: { time: "T", date: "D", dateTime: "F" },
    relative: { time: "R", date: "R", dateTime: "R" }
};

const UNITS = [
    [{ ms: 1e3 }, ["s", "sec", "secs", "second", "seconds"]],
    [{ ms: 6e4 }, ["m", "min", "mins", "minute", "minutes"]],
    [{ ms: 36e5 }, ["h", "hr", "hrs", "hour", "hours"]],
    [{ field: "Date", step: 1 }, ["d", "day", "days"]],
    [{ field: "Date", step: 7 }, ["w", "wk", "wks", "week", "weeks"]],
    [{ field: "Month", step: 1 }, ["mo", "mos", "month", "months"]],
    [{ field: "FullYear", step: 1 }, ["y", "yr", "yrs", "year", "years"]]
];

const UNITS_BY_NAME = new Map(UNITS.flatMap(([unit, names]) => names.map(name => [name, unit])));
const caseless = word => word.replace(/[a-z]/g, letter => `[${letter}${letter.toUpperCase()}]`);
const WORDS = [...UNITS_BY_NAME.keys()]
    .filter(name => name.length > 1)
    .sort((a, b) => b.length - a.length)
    .map(caseless)
    .join("|");
const DURATION_PART = String.raw`\d+(?:[ \t]*(?:${WORDS})|[smhdwy])\b`;
const DURATION_SEPARATOR = String.raw`(?:[ \t]*,[ \t]*|[ \t]+${caseless("and")}[ \t]+|[ \t]+)`;
const DURATION = String.raw`${DURATION_PART}(?:${DURATION_SEPARATOR}${DURATION_PART})*`;
const AGO = String.raw`[ \t]+${caseless("ago")}\b`;
const RELATIVE = String.raw`\b(?:${caseless("in")}[ \t]+(?<future>${DURATION})(?!${DURATION_SEPARATOR}${DURATION_PART}|${AGO})|(?<!${caseless("in")}[ \t]+(?:${DURATION_PART}${DURATION_SEPARATOR})*)(?<past>${DURATION})${AGO})`;

const SOURCES = [
    [`${TIME}[ \\t]+${DATE}`, "dateTime"],
    [`${DATE}[ \\t]+${TIME}`, "dateTime"],
    [TIME, "time"],
    [DATE, "date"]
];

const PATTERNS = SOURCES.map(([source, kind]) => [new RegExp(source, "g"), kind]);
const RELATIVE_PATTERN = new RegExp(RELATIVE, "g");
const DURATION_PARTS = /(\d+)[ \t]*([a-z]+)/gi;
const ESCAPED = [...SOURCES.map(([source]) => source), RELATIVE]
    .map(source => source.replace(/\(\?<(?![=!])\w+>/g, "(?:"))
    .join("|");

const SKIPPED = new RegExp(
    String.raw`(\`\`\`[\s\S]*?\`\`\`|\`[^\`\n]*\`|\[[^\]\n]*\]\([^)\s]*\)|https?:\/\/\S+|<[^\s<>]+>|\\(?:${ESCAPED}))`
);

function toTimestamp(match, groups, kind, options) {
    const date = new Date();
    if (groups.date) {
        const [first, second, third] = groups.date.split(/[./-]/).filter(Boolean);
        if (!third && !options.yearlessDates) return match;
        let [year, month, day] = [+first, +second, +third];
        if (first.length !== 4) {
            [day, month] = options.dateOrder === "month" ? [+second, +first] : [+first, +second];
            const currentYear = new Date().getFullYear();
            year = third ? +third : currentYear;
            if (third?.length === 2) year += year + 2e3 > currentYear + 20 ? 1900 : 2e3;
        }
        date.setFullYear(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return match;
    }
    if (groups.hours) {
        let hours = +groups.hours;
        const minutes = +(groups.minutes ?? 0);
        const meridiem = groups.meridiem?.toLowerCase();
        if (minutes > 59) return match;
        if (meridiem) {
            if (hours < 1 || hours > 12) return match;
            hours = (hours % 12) + (meridiem === "pm" ? 12 : 0);
        } else if (hours > 24 || (hours === 24 && minutes > 0)) return match;
        date.setHours(hours, minutes, 0, 0);
    }
    return `<t:${Math.round(date.getTime() / 1e3)}:${STYLES[options.style][kind]}>`;
}

function toRelativeTimestamp(match, { future, past }) {
    const date = new Date();
    const sign = future ? 1 : -1;
    for (const [, value, name] of (future ?? past).matchAll(DURATION_PARTS)) {
        const unit = UNITS_BY_NAME.get(name.toLowerCase());
        const amount = sign * +value;
        if ("ms" in unit) {
            date.setTime(date.getTime() + amount * unit.ms);
            continue;
        }
        const { field, step } = unit;
        if (field === "Date") {
            date.setDate(date.getDate() + amount * step);
            continue;
        }
        const day = date.getDate();
        date.setDate(1);
        date[`set${field}`](date[`get${field}`]() + amount * step);
        date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    }
    const seconds = Math.round(date.getTime() / 1e3);
    return isNaN(seconds) ? match : `<t:${seconds}:R>`;
}

function replaceTimestamps(content) {
    const options = {
        dateOrder: Settings.get("dateOrder", "day"),
        style: Settings.get("timestampStyle", "short"),
        yearlessDates: Settings.get("yearlessDates", true)
    };
    return content
        .split(SKIPPED)
        .map((part, index) => {
            if (index % 2) return part.startsWith("\\") ? part.slice(1) : part;
            return PATTERNS.reduce(
                (text, [pattern, kind]) =>
                    text.replace(pattern, (match, ...args) => toTimestamp(match, args.at(-1), kind, options)),
                part
            ).replace(RELATIVE_PATTERN, (match, ...args) => toRelativeTimestamp(match, args.at(-1)));
        })
        .join("");
}

/* modules/webpack.ts */
const useCreateForumPost = Webpack.getModule(Webpack.Filters.byStrings("use_nested_fields", "applied_tags"), {
    searchExports: true,
    withKey: true,
    cacheId: "ReplaceTimestamps.useCreateForumPost"
});

/* settings.json */
const items = [
    {
        type: "dropdown",
        name: "Date Order",
        note: "Whether the day or the month comes first in the dates you type. Dates starting with the year, like 2003-11-17, always work, and . / - all work as separators",
        id: "dateOrder",
        options: [
            {
                label: "Day first (17.11.2003)",
                value: "day"
            },
            {
                label: "Month first (11/17/2003)",
                value: "month"
            }
        ],
        value: "day"
    },
    {
        type: "dropdown",
        name: "Timestamp Style",
        note: 'How the converted times and dates are shown. Relative times like "in 5 min" always count from now',
        id: "timestampStyle",
        options: [
            {
                label: "Short (05:30, 17/11/2003)",
                value: "short"
            },
            {
                label: "Long (05:30:00, 17 November 2003)",
                value: "long"
            },
            {
                label: "Relative (in 2 hours)",
                value: "relative"
            }
        ],
        value: "short"
    },
    {
        type: "switch",
        name: "Dates Without a Year",
        note: "Converts dates like 17.11. to this year. Turn it off if prices or versions like 12.05. get converted by mistake",
        id: "yearlessDates",
        value: true
    },
    {
        type: "switch",
        name: "Apply to Message Edits",
        note: "Whether to also convert timestamps when editing messages",
        id: "applyToEdits",
        value: true
    }
];

const SettingsItems = {
    items: items
};

/* index.tsx */
class ReplaceTimestamps {
    start() {
        const dateFormat = Settings.get("dateFormat");
        if (dateFormat) {
            Settings.set("dateOrder", dateFormat.startsWith("MM") || dateFormat.startsWith("yyyy") ? "month" : "day");
            Settings.set("dateFormat", void 0);
        }
        showChangelog(manifest);
        this.patchMessageActions();
        this.patchForumPosts();
    }
    stop() {
        Patcher.unpatchAll();
    }
    patchMessageActions() {
        Patcher.before(MessageActions, "sendMessage", (_, [, message]) => {
            message.content = replaceTimestamps(message.content);
        });
        Patcher.before(MessageActions, "editMessage", (_, [, , message]) => {
            if (!Settings.get("applyToEdits", true)) return;
            message.content = replaceTimestamps(message.content);
        });
    }
    patchForumPosts() {
        if (!useCreateForumPost) return Logger.error("Failed to find useCreateForumPost");
        Patcher.after(...useCreateForumPost, (_, __, createPost) => {
            if (typeof createPost !== "function") return;
            return (content, ...args) =>
                createPost(typeof content === "string" ? replaceTimestamps(content) : content, ...args);
        });
    }
    getSettingsPanel() {
        return BdApi.React.createElement(SettingsPanel, { items: SettingsItems.items });
    }
}

module.exports = ReplaceTimestamps;
