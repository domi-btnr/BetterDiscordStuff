/**
 * @name MessagePeek
 * @version 1.3.0
 * @description See the last message in a Channel like on mobile
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/MessagePeek
 */

"use strict";

/* @manifest */
const manifest = {
    $schema: "../../common/Schemas/manifest.schema.json",
    name: "MessagePeek",
    version: "1.3.0",
    description: "See the last message in a Channel like on mobile",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/MessagePeek",
    changelog: {
        date: "2026-10-25",
        changes: [
            {
                type: "added",
                title: "What's new",
                items: [
                    "Timestamps are back in your DMs and update live as time passes",
                    "When you start Discord in a server, the previews of its most recently active channels load right away, just like your DMs"
                ]
            },
            {
                type: "improved",
                title: "Rebuilt from the ground up",
                items: [
                    "Rewrote the plugin from the ground up, making it lighter and less likely to break when Discord updates",
                    "Previews support more message types like GIFs, polls and voice messages",
                    "Changing a setting now applies right away"
                ]
            }
        ]
    }
};

/* @api */
const { Components, Data, DOM, Hooks, Logger, Patcher, ReactUtils, UI, Utils, Webpack } = new BdApi(manifest.name);

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

/* ../../common/Webpack/Parser.ts */
const Parser = lazyExport(() => Webpack.getByKeys("parseTopic"));

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

const de$1 = {
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

const en$1 = {
    title: title,
    description: description,
    retry: retry,
    mini: mini,
    copy: copy,
    copied: copied,
    keys: keys
};

/* @styles */
const STYLE_ID = manifest.name + "-popout-styles";

const Styles = {
    sheets: [],
    _element: null,
    _listener: null,
    get _store() {
        return Webpack.getStore("PopoutWindowStore");
    },
    _forEachPopout(cb) {
        if (!this._store) return;
        for (const key of this._store.getWindowKeys()) {
            const doc = this._store.getWindow(key)?.document;
            if (doc) cb(doc);
        }
    },
    _injectPopouts() {
        const css = this.sheets.join("\n");
        this._forEachPopout(doc => {
            if (doc.getElementById(STYLE_ID)) return;
            doc.head.append(DOM.createElement("style", { id: STYLE_ID }, css));
        });
    },
    load() {
        DOM.addStyle(this.sheets.join("\n"));
        if (!this._store) return;
        this._listener = () => this._injectPopouts();
        this._store.addChangeListener(this._listener);
        this._injectPopouts();
    },
    unload() {
        DOM.removeStyle();
        if (!this._store) return;
        if (this._listener) this._store.removeChangeListener(this._listener);
        this._listener = null;
        this._forEachPopout(doc => doc.getElementById(STYLE_ID)?.remove());
    }
};

/* ../../common/ErrorBoundary/style.scss */
Styles.sheets.push(
    "/* ../../common/ErrorBoundary/style.scss */",
    `.error-boundary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 12px 16px;
  border: 1px solid var(--status-danger, #f23f43);
  border-radius: 8px;
  background-color: color-mix(in oklab, var(--status-danger, #f23f43) 8%, transparent);
}
.error-boundary .error-boundary-actions {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 8px;
}
.error-boundary .error-boundary-content {
  display: flex;
  flex: 999 1 320px;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.error-boundary .error-boundary-content .error-boundary-keybind {
  display: inline-flex;
  gap: 2px;
  margin: 0 2px;
  vertical-align: text-bottom;
}
.error-boundary .error-boundary-content .error-boundary-keybind kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 20px;
  height: 20px;
  padding: 0 5px 1px;
  border: 1px solid var(--border-strong, rgba(151, 151, 159, 0.44));
  border-radius: 4px;
  background-color: var(--background-mod-strong, rgba(151, 151, 159, 0.2));
  box-shadow: inset 0 -2px 0 0 var(--background-mod-normal, rgba(151, 151, 159, 0.16));
  color: var(--text-default, #dbdee1);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
}
.error-boundary .error-boundary-content .error-boundary-keybind kbd .error-boundary-symbol {
  font-family: system-ui, sans-serif;
}
.error-boundary .error-boundary-content .error-boundary-details {
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--text-muted, #949ba4);
  font-family: var(--font-code, monospace);
  font-size: 12px;
  white-space: pre-wrap;
  user-select: text;
}

.error-boundary-mini {
  display: inline-flex;
  margin-left: 4px;
  color: var(--status-danger, #f23f43);
  vertical-align: text-bottom;
}`
);
const styles$2 = {
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

const { Trans, useTranslation: useTranslation$1 } = createI18n({
    resources: { en: en$1, de: de$1 },
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
    const { t } = useTranslation$1();
    return BdApi.React.createElement(
        "span",
        { className: styles$2.errorBoundaryKeybind },
        keys.map(({ label, name }) =>
            BdApi.React.createElement(
                "kbd",
                { key: label },
                name
                    ? BdApi.React.createElement(
                          "span",
                          { "className": styles$2.errorBoundarySymbol, "role": "img", "aria-label": t(name) },
                          label
                      )
                    : label
            )
        )
    );
}

function CopyErrorButton({ id, error }) {
    const { t } = useTranslation$1();
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
    const { t } = useTranslation$1();
    const label = t("mini", { plugin: manifest.name });
    return BdApi.React.createElement(
        "span",
        { "className": styles$2.errorBoundaryMini, "role": "img", "aria-label": label, "title": label },
        BdApi.React.createElement(ErrorIcon, { width: "16", height: "16" })
    );
}

function Fallback({ id, error, onRetry }) {
    const { t } = useTranslation$1();
    return BdApi.React.createElement(
        "div",
        { className: styles$2.errorBoundary, role: "alert" },
        BdApi.React.createElement(
            "div",
            { className: styles$2.errorBoundaryContent },
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
                    { className: styles$2.errorBoundaryDetails },
                    "[",
                    id,
                    "] ",
                    getShortStack(error)
                )
        ),
        BdApi.React.createElement(
            "div",
            { className: styles$2.errorBoundaryActions },
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

/* ../../common/Utils/fiber.ts */
const ReactReconciler = lazyExport(() =>
    Webpack.getBySource(".errorRecoveryDisabledLanes|=", {
        mapDeclarations: true,
        map: {
            enqueueConcurrentRenderForLane: fn =>
                /^function \w+\(\w+,\w+\)\{return \w+\(\w+,null,null,\w+\),\w+\(\w+\)\}$/.test(String(fn)),
            scheduleUpdateOnFiber: fn => String(fn).includes(".cancelPendingCommit)&&(")
        }
    })
);

const SYNC_LANE = 2;
const FORCE_UPDATE = 131072;

function forceUpdate(fiber) {
    const { enqueueConcurrentRenderForLane, scheduleUpdateOnFiber } = ReactReconciler;
    if (!enqueueConcurrentRenderForLane || !scheduleUpdateOnFiber) return;
    fiber.flags |= FORCE_UPDATE;
    if (fiber.alternate) fiber.alternate.flags |= FORCE_UPDATE;
    const root = enqueueConcurrentRenderForLane(fiber, SYNC_LANE);
    if (root) scheduleUpdateOnFiber(root, fiber, SYNC_LANE);
}

const getOriginal = component => component?.__originalFunction ?? component;

function rerenderComponent(component, filter) {
    if (Array.isArray(component)) component = component[0]?.[component[1]];
    const original = getOriginal(component);
    if (typeof original !== "function") return;
    const container = document.getElementById("app-mount");
    const key = container && Object.keys(container).find(key2 => key2.startsWith("__reactContainer$"));
    const root = key ? container[key] : void 0;
    const stack = [root?.stateNode?.current ?? root];
    while (stack.length) {
        const fiber = stack.pop();
        if (!fiber) continue;
        stack.push(fiber.sibling, fiber.child);
        if (getOriginal(fiber.type) !== original || filter) continue;
        for (const version of [fiber, fiber.alternate]) {
            if (!version) continue;
            if (version.elementType === version.type) version.elementType = component;
            version.type = component;
        }
        forceUpdate(fiber);
    }
}

/* locales/de.json */
const you$1 = "Du";

const content$1 = {
    message: "Hat eine Nachricht gesendet",
    image: "Hat ein Bild gesendet",
    image_other: "Hat {{count}} Bilder gesendet",
    video: "Hat ein Video gesendet",
    video_other: "Hat {{count}} Videos gesendet",
    audio: "Hat eine Audiodatei gesendet",
    file: "Hat eine Datei gesendet",
    file_other: "Hat {{count}} Dateien gesendet",
    attachment_other: "Hat {{count}} Anhänge gesendet",
    gif: "Hat ein GIF gesendet",
    sticker: "Hat einen Sticker gesendet",
    poll: "Hat eine Umfrage gesendet",
    voiceMessage: "Sprachnachricht",
    forwarded: "Hat eine Nachricht weitergeleitet"
};

const units$1 = {
    second: "{{value}} Sek.",
    minute: "{{value}} Min.",
    hour: "{{value}} Std.",
    day: "{{value}} T",
    week: "{{value}} W",
    month: "{{value}} M",
    year: "{{value}} J"
};

const de = {
    you: you$1,
    content: content$1,
    units: units$1
};

/* locales/en.json */
const you = "You";

const content = {
    message: "Sent a message",
    image: "Sent an image",
    image_other: "Sent {{count}} images",
    video: "Sent a video",
    video_other: "Sent {{count}} videos",
    audio: "Sent an audio file",
    file: "Sent a file",
    file_other: "Sent {{count}} files",
    attachment_other: "Sent {{count}} attachments",
    gif: "Sent a GIF",
    sticker: "Sent a sticker",
    poll: "Sent a poll",
    voiceMessage: "Voice Message",
    forwarded: "Forwarded a message"
};

const units = {
    second: "{{value}}s",
    minute: "{{value}}m",
    hour: "{{value}}h",
    day: "{{value}}d",
    week: "{{value}}w",
    month: "{{value}}mo",
    year: "{{value}}y"
};

const en = {
    you: you,
    content: content,
    units: units
};

/* modules/i18n.ts */
const { t, useTranslation } = createI18n({
    resources: { en, de },
    discord: {
        "content.message": "sDqZHL",
        "content.image": "tCcq5p",
        "content.image_other": "rtfTKp",
        "content.video": "KxO2Yl",
        "content.video_other": "nYvQ07",
        "content.audio": "FWqQt5",
        "content.file": "mX8M6i",
        "content.file_other": "y0gZht",
        "content.attachment_other": "8/qgDd",
        "content.gif": "p0oZmy",
        "content.sticker": "dyquw8",
        "content.poll": "n3shVJ",
        "content.voiceMessage": "c8U6xd",
        "content.forwarded": "9ddYKt"
    }
});

/* modules/webpack.ts */
const { Filters } = Webpack;

const Modules = Webpack.getBulkKeyed({
    ChannelActions: {
        filter: Filters.byKeys("preload", "fetchChannel"),
        cacheId: "MessagePeek.ChannelActions"
    },
    DMRow: {
        filter: Filters.combine(
            Filters.byStrings("getRecipientId", "isMultiUserDM"),
            module => !String(module).includes("aria-posinset"),
            Filters.bySource('location:"PrivateChannel"')
        ),
        searchExports: true,
        withKey: true,
        cacheId: "MessagePeek.DMRow"
    }
});

const { ChannelActions, DMRow } = Modules;

const getGuildChannelRow = signal =>
    Webpack.waitForModule(Filters.byStrings("connectDragPreview", "hasActiveThreads", "iconClassName"), {
        searchExports: true,
        withKey: true,
        cacheId: "MessagePeek.GuildChannelRow",
        signal
    });

const ChannelStore = Webpack.getStore("ChannelStore");
const GuildChannelStore = Webpack.getStore("GuildChannelStore");
const MessageStore = Webpack.getStore("MessageStore");
const SelectedGuildStore = Webpack.getStore("SelectedGuildStore");
const UserStore = Webpack.getStore("UserStore");

/* modules/messages.ts */
const IS_VOICE_MESSAGE = 1 << 13;

const ATTACHMENT_GROUPS = {
    image: "content.image",
    gif: "content.image",
    video: "content.video",
    audio: "content.file",
    file: "content.file"
};

function useLastMessage(channelId) {
    return Hooks.useStateFromStores([MessageStore], () => MessageStore.getMessages(channelId)?.last(), [channelId]);
}

function preloadChannels(guildId, channels, signal) {
    channels
        .filter(channel => channel.lastMessageId && !MessageStore.getMessages(channel.id)?.last())
        .slice(0, Settings.get("preloadLimit", 10))
        .reduce(
            (promise, channel, index) =>
                promise.then(() => {
                    if (signal.aborted) return;
                    ChannelActions?.preload(guildId, channel.id);
                    return new Promise(resolve => setTimeout(resolve, 125 + index * 125));
                }),
            Promise.resolve()
        );
}

function getAttachmentKind({ content_type: type = "" }) {
    if (type === "image/gif") return "gif";
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    return "file";
}

function hasPreview(channelId, location) {
    if (!Settings.get(location === "dm" ? "showInDMs" : "showInGuilds", true)) return false;
    const message = MessageStore.getMessages(channelId)?.last();
    return !!message && !!getMessagePreview(message);
}

function getMessagePreview(message) {
    const [embed] = message.embeds;
    const isGif = String(embed?.type) === "gifv" && message.content === embed.url;
    if (message.content && !isGif) return message.content;
    if (embed?.rawDescription) return embed.rawDescription;
    if (isGif) return t("content.gif");
    if (message.messageSnapshots?.length) return t("content.forwarded");
    if (message.poll) return t("content.poll");
    if (message.stickerItems?.length) return t("content.sticker");
    if (message.flags & IS_VOICE_MESSAGE) return t("content.voiceMessage");
    const kinds = message.attachments.map(getAttachmentKind);
    if (kinds.length === 1) return t(`content.${kinds[0]}`);
    if (kinds.length > 1) {
        const groups = new Set(kinds.map(kind => ATTACHMENT_GROUPS[kind]));
        const [group] = groups;
        return t(groups.size === 1 ? group : "content.attachment", { count: kinds.length });
    }
    if (embed || message.components.length) return t("content.message");
}

/* modules/rowHeight.ts */
const EXTRA_HEIGHT = { dm: 8, guild: 16 };
const originals = new WeakMap();
const lists = new Set();
const pendingUpdates = new Set();
let tracking = false;
let frame;

function getChannelId(list, location, section, row) {
    if (location === "dm") return section === 1 ? list.props.privateChannelIds?.[row] : void 0;
    const { guildChannels } = list.props;
    try {
        if (!guildChannels || guildChannels.isPlaceholderRow(section, row)) return;
        return guildChannels.getChannelFromSectionRow(section, row)?.channel?.id;
    } catch {
        return void 0;
    }
}

function updateList(list) {
    pendingUpdates.add(list);
    frame ??= requestAnimationFrame(() => {
        frame = void 0;
        pendingUpdates.forEach(list2 => list2.forceUpdate());
        pendingUpdates.clear();
    });
}

function trackList(node, location) {
    if (!tracking) return;
    let fiber = ReactUtils.getInternalInstance(node);
    while (fiber && typeof fiber.stateNode?.getRowHeight !== "function") fiber = fiber.return;
    const list = fiber?.stateNode;
    if (!list || originals.has(list)) return list;
    const getRowHeight = list.getRowHeight;
    originals.set(list, getRowHeight);
    list.getRowHeight = (section, row) => {
        const channelId = getChannelId(list, location, section, row);
        const extra = channelId && hasPreview(channelId, location) ? EXTRA_HEIGHT[location] : 0;
        return getRowHeight.call(list, section, row) + extra;
    };
    for (const ref of lists) if (!ref.deref()) lists.delete(ref);
    lists.add(new WeakRef(list));
    updateList(list);
    return list;
}

function startTracking() {
    tracking = true;
}

function stopTracking() {
    tracking = false;
    if (frame) cancelAnimationFrame(frame);
    frame = void 0;
    pendingUpdates.clear();
    for (const ref of lists) {
        const list = ref.deref();
        if (!list) continue;
        list.getRowHeight = originals.get(list);
        originals.delete(list);
        list.forceUpdate();
    }
    lists.clear();
}

/* components/preview.scss */
Styles.sheets.push(
    "/* components/preview.scss */",
    `.message-peek-dm:has(.message-peek-preview) {
  height: 50px;
}
.density-compact .message-peek-dm:has(.message-peek-preview) {
  height: 46px;
}
.density-cozy .message-peek-dm:has(.message-peek-preview) {
  height: 56px;
}

.message-peek-preview {
  margin-top: -2px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.message-peek-preview .message-peek-preview-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  line-height: 16px;
}`
);
const styles$1 = {
    messagePeekDm: "message-peek-dm",
    messagePeekPreview: "message-peek-preview",
    messagePeekPreviewText: "message-peek-preview-text"
};

/* components/preview.tsx */
const Tooltip = Components.Tooltip;

function PreviewText({ channelId, location }) {
    const { t } = useTranslation();
    const settings = Hooks.useStateFromStores(
        [Settings],
        () => ({
            enabled: Settings.get(location === "dm" ? "showInDMs" : "showInGuilds", true),
            showAuthor: Settings.get("showAuthor", true),
            showYourselfAsYou: Settings.get("showYourselfAsYou", true),
            charLimit: Settings.get("tooltipCharacterLimit", 256)
        }),
        [location],
        true
    );
    const message = useLastMessage(channelId);
    const content = settings.enabled && message ? getMessagePreview(message) : void 0;
    const ref = BdApi.React.useRef(null);
    const list = BdApi.React.useRef(void 0);
    const hadContent = BdApi.React.useRef(!!content);
    BdApi.React.useLayoutEffect(() => {
        if (ref.current) list.current = trackList(ref.current, location);
        if (hadContent.current !== !!content && list.current) updateList(list.current);
        hadContent.current = !!content;
    }, [!!content]);
    const tooltip = BdApi.React.useMemo(() => {
        if (!content) return;
        const { charLimit } = settings;
        return Parser.parse(content.length > charLimit ? `${content.slice(0, charLimit).trim()}\u2026` : content);
    }, [content, settings.charLimit]);
    const text = BdApi.React.useMemo(() => content && Parser.parseInlineReply(content), [content]);
    if (!message || !content) return null;
    const { author } = message;
    const isYou = settings.showYourselfAsYou && author.id === UserStore.getCurrentUser()?.id;
    const authorName = isYou ? t("you") : author.globalName || author.username;
    return BdApi.React.createElement(
        "div",
        { ref, className: styles$1.messagePeekPreview },
        BdApi.React.createElement(Tooltip, { text: tooltip }, props =>
            BdApi.React.createElement(
                "div",
                { ...props, className: styles$1.messagePeekPreviewText },
                settings.showAuthor && `${authorName}: `,
                text
            )
        )
    );
}

function Preview(props) {
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: "MessagePeek.Preview", mini: true },
        BdApi.React.createElement(PreviewText, { ...props })
    );
}

/* components/timestamp.scss */
Styles.sheets.push(
    "/* components/timestamp.scss */",
    `.message-peek-timestamp {
  flex-shrink: 0;
  align-content: center;
  margin-right: 5px;
  color: var(--channels-default);
}`
);
const styles = {
    messagePeekTimestamp: "message-peek-timestamp"
};

/* components/timestamp.tsx */
const SECOND = 1e3;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS = [
    ["year", 365 * DAY],
    ["month", 30 * DAY],
    ["week", 7 * DAY],
    ["day", DAY],
    ["hour", HOUR],
    ["minute", MINUTE],
    ["second", SECOND]
];

const dateFormatters = new Map();

function useRelativeTime(timestamp) {
    const [tick, setTick] = BdApi.React.useState(0);
    const elapsed = timestamp === void 0 ? 0 : Math.max(0, Date.now() - timestamp);
    const [unit, ms] = UNITS.find(([, ms2]) => elapsed >= ms2) ?? UNITS[UNITS.length - 1];
    BdApi.React.useEffect(() => {
        if (timestamp === void 0) return;
        const timeout = setTimeout(() => setTick(count => count + 1), Math.min(ms - (elapsed % ms), DAY));
        return () => clearTimeout(timeout);
    }, [tick, timestamp]);
    return timestamp === void 0 ? void 0 : { value: Math.floor(elapsed / ms), unit };
}

function formatDate(timestamp, locale) {
    let formatter = dateFormatters.get(locale);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        dateFormatters.set(locale, formatter);
    }
    return formatter.format(timestamp);
}

function LastMessageTimestamp({ channelId, location }) {
    const { t } = useTranslation();
    const locale = useLocale();
    const enabled = Hooks.useStateFromStores(
        [Settings],
        () =>
            Settings.get(location === "dm" ? "showInDMs" : "showInGuilds", true) && Settings.get("showTimestamp", true),
        [location]
    );
    const message = useLastMessage(channelId);
    const timestamp = message && Number(message.timestamp);
    const relativeTime = useRelativeTime(timestamp);
    if (!enabled || timestamp === void 0 || !relativeTime) return null;
    return BdApi.React.createElement(Tooltip, { text: formatDate(timestamp, locale) }, props =>
        BdApi.React.createElement(
            "div",
            { ...props, className: styles.messagePeekTimestamp },
            t(`units.${relativeTime.unit}`, { value: relativeTime.value })
        )
    );
}

function Timestamp(props) {
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: "MessagePeek.Timestamp", mini: true },
        BdApi.React.createElement(LastMessageTimestamp, { ...props })
    );
}

/* modules/elements.tsx */
const findInTree = (tree, filter) => Utils.findInTree(tree, filter, { walkable: ["children", "props"] });
const findByClassName = (tree, className) =>
    findInTree(tree, node => typeof node?.props?.className === "string" && node.props.className.startsWith(className));

function MessagePeek$1({ __original: original, __patch: patch, ...props }) {
    const res = original(props);
    try {
        patch(res);
    } catch (error) {
        Logger.error("Failed to patch", original, error);
    }
    return res;
}

const isWrapped = element => element?.type === MessagePeek$1;

function patchRender(element, patch) {
    if (typeof element?.type !== "function" || isWrapped(element)) return;
    element.props = { ...element.props, __original: element.type, __patch: patch };
    element.type = MessagePeek$1;
}

/* settings.json */
const items = [
    {
        type: "switch",
        name: "Show in DMs",
        note: "",
        id: "showInDMs",
        value: true
    },
    {
        type: "switch",
        name: "Show in Guilds",
        note: "",
        id: "showInGuilds",
        value: true
    },
    {
        type: "switch",
        name: "Show Author",
        note: "Whether to show the name of the Author or not",
        id: "showAuthor",
        value: true
    },
    {
        type: "switch",
        name: 'Show as "You"',
        note: 'Whether to show your name or "You"',
        id: "showYourselfAsYou",
        value: true
    },
    {
        type: "switch",
        name: "Show Timestamp",
        note: "Whether to show the relative timestamp next to the Channel or not",
        id: "showTimestamp",
        value: true
    },
    {
        type: "slider",
        name: "Preload Limit",
        note: "How many DMs or channels of the currently selected server to load on startup. This makes an API request for each channel, so be careful with this setting",
        id: "preloadLimit",
        minValue: 0,
        maxValue: 30,
        markers: [0, 5, 10, 20, 30],
        stickToMarkers: false,
        defaultValue: 10
    },
    {
        type: "slider",
        name: "Tooltip Character Limit",
        note: "The maximum number of characters to show in the tooltip",
        id: "tooltipCharacterLimit",
        minValue: 64,
        maxValue: 1024,
        markers: [64, 128, 256, 512, 1024],
        stickToMarkers: true,
        defaultValue: 256
    }
];

const SettingsItems = {
    items: items
};

/* index.tsx */
const MAX_PRELOAD = 30;

class MessagePeek {
    controller;
    unpatchDMs;
    unpatchGuildChannels;
    async start() {
        if (Settings.get("preloadLimit", 10) > MAX_PRELOAD) Settings.set("preloadLimit", 10);
        Styles.load();
        showChangelog(manifest);
        this.controller = new AbortController();
        startTracking();
        this.unpatchDMs = this.patchDMs(this.controller.signal);
        this.unpatchGuildChannels = await this.patchGuildChannels(this.controller.signal);
    }
    stop() {
        this.controller?.abort();
        this.unpatchDMs?.();
        this.unpatchGuildChannels?.();
        Patcher.unpatchAll();
        stopTracking();
        Styles.unload();
    }
    /**
     * Patches a row component and re-renders the rows that are already on screen.
     * @returns Removes the patch again and re-renders the rows.
     */
    patchRows(row, callback) {
        const unpatch = Patcher.after(...row, callback);
        rerenderComponent(row);
        return () => {
            unpatch?.();
            rerenderComponent(row);
        };
    }
    patchDMs(signal) {
        if (!DMRow) {
            Logger.error("Failed to find DMRow");
            return;
        }
        const unpatch = this.patchRows(DMRow, (_, args, res) => {
            const [{ channel }] = args;
            patchRender(res, inner => {
                if (signal.aborted) return;
                const row = findInTree(
                    inner,
                    node =>
                        typeof node?.type === "function"
                        && !isWrapped(node)
                        && "id" in node.props
                        && "children" in node.props
                );
                patchRender(row, rowRes => {
                    const name = findInTree(rowRes, node => node?.type?.displayName === "AvatarWithText");
                    if (name) {
                        name.props.innerClassName = Utils.className(name.props.innerClassName, styles$1.messagePeekDm);
                        name.props.subText = BdApi.React.createElement(
                            BdApi.React.Fragment,
                            null,
                            name.props.subText,
                            BdApi.React.createElement(Preview, { channelId: channel.id, location: "dm" })
                        );
                    }
                    const icons = findByClassName(rowRes, "iconsContainer");
                    if (icons) {
                        icons.props.children = BdApi.React.createElement(
                            BdApi.React.Fragment,
                            null,
                            BdApi.React.createElement(Timestamp, { channelId: channel.id, location: "dm" }),
                            icons.props.children
                        );
                    }
                });
            });
        });
        preloadChannels("@me", ChannelStore.getSortedPrivateChannels(), signal);
        return unpatch;
    }
    async patchGuildChannels(signal) {
        const GuildChannelRow = await getGuildChannelRow(signal);
        if (!GuildChannelRow || signal.aborted) return;
        const unpatch = this.patchRows(GuildChannelRow, (_, args, res) => {
            const [{ channel }] = args;
            const name = findByClassName(res, "name__");
            if (name) {
                name.props.children = BdApi.React.createElement(
                    BdApi.React.Fragment,
                    null,
                    name.props.children,
                    BdApi.React.createElement(Preview, { channelId: channel.id, location: "guild" })
                );
            }
            const linkTop = findByClassName(res, "linkTop")?.props.children;
            if (Array.isArray(linkTop)) {
                linkTop.splice(
                    linkTop.length - 1,
                    0,
                    BdApi.React.createElement(Timestamp, { channelId: channel.id, location: "guild" })
                );
            }
        });
        const guildId = SelectedGuildStore.getGuildId();
        if (guildId) {
            const channels = GuildChannelStore.getSelectableChannels(guildId).map(({ channel }) => channel);
            channels.sort((a, b) => (BigInt(b.lastMessageId ?? 0) > BigInt(a.lastMessageId ?? 0) ? 1 : -1));
            preloadChannels(guildId, channels, signal);
        }
        return unpatch;
    }
    getSettingsPanel() {
        return BdApi.React.createElement(SettingsPanel, { items: SettingsItems.items });
    }
}

module.exports = MessagePeek;
