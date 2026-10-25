/**
 * @name ShowSpectators
 * @version 1.2.0
 * @description Shows you who's spectating your stream under the screenshare panel
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ShowSpectators
 */

"use strict";

/* @manifest */
const manifest = {
    $schema: "../../common/Schemas/manifest.schema.json",
    name: "ShowSpectators",
    version: "1.2.0",
    description: "Shows you who's spectating your stream under the screenshare panel",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ShowSpectators",
    changelog: {
        date: "2026-10-22",
        changes: [
            {
                type: "added",
                title: "New options",
                items: [
                    'Prefer it short? Turn on the new "Compact Mode" option to list spectators in a single sentence. Clicking a name in the panel opens their profile, just like the avatars do',
                    "Watching someone else's stream? The panel now shows who else is watching. Don't need it? Turn off the new \"Show Watched Stream's Spectators\" option"
                ]
            },
            {
                type: "improved",
                title: "Improved",
                items: [
                    "Rewrote the plugin from the ground up, making it lighter and less likely to break when Discord updates",
                    "Spectators now show their server avatars"
                ]
            }
        ]
    }
};

/* @api */
const { Components, Data, DOM, Hooks, Logger, Patcher, UI, Webpack } = new BdApi(manifest.name);

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
function getLocalizedString(key, values) {
    if (!values) return I18nModule.intl?.formatToPlainString(I18nModule.t[key]) ?? void 0;
    return I18nModule.intl?.format(I18nModule.t[key], values) ?? void 0;
}

function getLocale() {
    return Webpack.getStore("LocaleStore").locale;
}

/* ../../common/Changelog/footer.tsx */
const { Text: Text$2 } = Components;

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
        Text$2,
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
const styles$3 = {
    errorBoundary: "error-boundary",
    errorBoundaryActions: "error-boundary-actions",
    errorBoundaryContent: "error-boundary-content",
    errorBoundaryKeybind: "error-boundary-keybind",
    errorBoundarySymbol: "error-boundary-symbol",
    errorBoundaryDetails: "error-boundary-details",
    errorBoundaryMini: "error-boundary-mini"
};

/* ../../common/ErrorBoundary/index.tsx */
const { Button, ErrorBoundary: BdErrorBoundary, Text: Text$1 } = Components;

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
        { className: styles$3.errorBoundaryKeybind },
        keys.map(({ label, name }) =>
            BdApi.React.createElement(
                "kbd",
                { key: label },
                name
                    ? BdApi.React.createElement(
                          "span",
                          { "className": styles$3.errorBoundarySymbol, "role": "img", "aria-label": t(name) },
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
        { "className": styles$3.errorBoundaryMini, "role": "img", "aria-label": label, "title": label },
        BdApi.React.createElement(ErrorIcon, { width: "16", height: "16" })
    );
}

function Fallback({ id, error, onRetry }) {
    const { t } = useTranslation();
    return BdApi.React.createElement(
        "div",
        { className: styles$3.errorBoundary, role: "alert" },
        BdApi.React.createElement(
            "div",
            { className: styles$3.errorBoundaryContent },
            BdApi.React.createElement(
                Text$1,
                { size: Text$1.Sizes.SIZE_16, color: Text$1.Colors.HEADER_PRIMARY, strong: true },
                t("title")
            ),
            BdApi.React.createElement(
                Text$1,
                { color: Text$1.Colors.MUTED },
                BdApi.React.createElement(Trans, {
                    i18nKey: "description",
                    values: { plugin: manifest.name },
                    components: { keybind: BdApi.React.createElement(Keybind, { keys: CONSOLE_KEYS }) }
                })
            ),
            error
                && BdApi.React.createElement(
                    "code",
                    { className: styles$3.errorBoundaryDetails },
                    "[",
                    id,
                    "] ",
                    getShortStack(error)
                )
        ),
        BdApi.React.createElement(
            "div",
            { className: styles$3.errorBoundaryActions },
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

/* modules/webpack.ts */
const { Filters } = Webpack;

const Modules = Webpack.getBulkKeyed({
    AccountPanelSections: {
        filter: Filters.combine(
            Filters.byStrings(".Provider,{value:"),
            Filters.bySource("createContext([])", "newestAnalyticsLocation:")
        ),
        searchExports: true,
        withKey: true,
        cacheId: "ShowSpectators.AccountPanelSections"
    },
    Avatar: {
        filter: Filters.byStrings("typingIndicatorRef", "statusTooltipDelay", "statusBackdropColor"),
        searchExports: true,
        cacheId: "ShowSpectators.Avatar"
    },
    AvatarStyles: {
        filter: Filters.byKeys("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar"),
        cacheId: "ShowSpectators.AvatarStyles"
    },
    Clickable: {
        filter: Filters.byStrings("this.context?this.renderNonInteractive():"),
        searchExports: true,
        cacheId: "ShowSpectators.Clickable"
    },
    NameUtils: {
        filter: Filters.byKeys("getName", "getNickname", "useName"),
        cacheId: "ShowSpectators.NameUtils"
    },
    StreamIcon: {
        filter: Filters.byStrings(".STATUS_SCREENSHARE"),
        withKey: true,
        cacheId: "ShowSpectators.StreamIcon"
    },
    UserPopout: {
        filter: Filters.combine(
            m => m?.$$typeof === Symbol.for("react.memo"),
            Filters.bySource('type:"popout",withMutualGuilds', "disableUserProfileLink")
        ),
        searchExports: true,
        cacheId: "ShowSpectators.UserPopout"
    },
    UserProfileActions: {
        filter: Filters.byKeys("openUserProfileModal"),
        cacheId: "ShowSpectators.UserProfileActions"
    },
    UserSummaryItem: {
        filter: Filters.byStrings("defaultRenderUser", "showDefaultAvatarsForNullUsers"),
        cacheId: "ShowSpectators.UserSummaryItem"
    }
});

const {
    AccountPanelSections,
    Avatar,
    AvatarStyles,
    Clickable,
    NameUtils,
    StreamIcon,
    UserPopout,
    UserProfileActions,
    UserSummaryItem
} = Modules;

const ApplicationStreamingStore = Webpack.getStore("ApplicationStreamingStore");

const ChannelRTCStore = Webpack.getStore("ChannelRTCStore");
const SelectedChannelStore = Webpack.getStore("SelectedChannelStore");
const UserStore = Webpack.getStore("UserStore");
const WindowStore = Webpack.getStore("WindowStore");

/* modules/spectators.ts */
const Strings = {
    SPECTATORS: "BR7Tno",
    NUM_USERS: "3uHFUR",
    USER_LIST: "A+bT9O"
};

const MAX_COMPACT_NAMES = 3;
const getDisplayName = (user, { guildId, channelId }) =>
    NameUtils?.getName(guildId, channelId, user) ?? user.globalName ?? user.username;

function getSpectatorSentence(spectators, renderName = user => getDisplayName(user, spectators)) {
    const names = spectators.users.slice(0, MAX_COMPACT_NAMES).map(renderName);
    const others = spectators.total - names.length;
    if (others > 0) names.push(getLocalizedString(Strings.NUM_USERS, { num: others }));
    return getLocalizedString(Strings.USER_LIST, {
        users: names.length,
        user1: names[0],
        user2: names[1],
        commaSeparatedUsers: BdApi.React.createElement(
            BdApi.React.Fragment,
            null,
            ...names.slice(0, -1).flatMap((name, i) => (i ? [", ", name] : [name]))
        ),
        lastUser: names.at(-1)
    });
}

function getWatchedStream() {
    const currentUserId = UserStore.getCurrentUser()?.id;
    const watched = ApplicationStreamingStore.getAllActiveStreams().filter(stream => stream.ownerId !== currentUserId);
    if (!watched.length) return null;
    const channelId = SelectedChannelStore.getVoiceChannelId();
    const selected = channelId ? ChannelRTCStore.getSelectedParticipant(channelId) : null;
    const selectedOwnerId = selected && "stream" in selected ? selected.stream.ownerId : void 0;
    const lastActiveOwnerId = ApplicationStreamingStore.getLastActiveStream()?.ownerId;
    return (
        watched.find(stream => stream.ownerId === selectedOwnerId)
        ?? watched.find(stream => stream.ownerId === lastActiveOwnerId)
        ?? watched[0]
    );
}

function isSameSpectators(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.guildId === b.guildId
        && a.channelId === b.channelId
        && a.streamer === b.streamer
        && a.total === b.total
        && a.users.length === b.users.length
        && a.users.every((user, i) => user === b.users[i])
    );
}

function useSpectators() {
    return Hooks.useStateFromStores(
        [ApplicationStreamingStore, ChannelRTCStore, SelectedChannelStore, Settings, UserStore],
        () => {
            const stream =
                ApplicationStreamingStore.getCurrentUserActiveStream()
                ?? (Settings.get("showWatchedStream", true) ? getWatchedStream() : null);
            if (!stream) return null;
            const viewerIds = ApplicationStreamingStore.getViewerIds(stream);
            const isOwnStream = stream.ownerId === UserStore.getCurrentUser()?.id;
            return {
                guildId: stream.guildId,
                channelId: stream.channelId,
                streamer: isOwnStream ? void 0 : UserStore.getUser(stream.ownerId),
                total: viewerIds.length,
                users: viewerIds.map(id => UserStore.getUser(id)).filter(Boolean)
            };
        },
        [],
        isSameSpectators
    );
}

/* components/panel.scss */
Styles.sheets.push(
    "/* components/panel.scss */",
    `.show-spectators-panel {
  padding: 8px;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}
.show-spectators-panel .show-spectators-panel-content {
  margin-top: 4px;
  padding-bottom: 4px;
}`
);
const styles$2 = {
    showSpectatorsPanel: "show-spectators-panel",
    showSpectatorsPanelContent: "show-spectators-panel-content"
};

/* components/spectator.scss */
Styles.sheets.push(
    "/* components/spectator.scss */",
    `.show-spectators-name {
  cursor: pointer;
}
.show-spectators-name:hover {
  text-decoration: underline;
}`
);
const styles$1 = {
    showSpectatorsName: "show-spectators-name"
};

/* components/tooltip.scss */
Styles.sheets.push(
    "/* components/tooltip.scss */",
    `.show-spectators-tooltip-title {
  font-weight: 600;
}
.show-spectators-tooltip-title + * {
  margin-top: 8px;
}

.show-spectators-tooltip-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.show-spectators-tooltip-list .show-spectators-tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.show-spectators-tooltip-list .show-spectators-tooltip-row .show-spectators-tooltip-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.show-spectators-tooltip-list .show-spectators-tooltip-more {
  color: var(--text-muted);
}`
);
const styles = {
    showSpectatorsTooltipTitle: "show-spectators-tooltip-title",
    showSpectatorsTooltipList: "show-spectators-tooltip-list",
    showSpectatorsTooltipRow: "show-spectators-tooltip-row",
    showSpectatorsTooltipAvatar: "show-spectators-tooltip-avatar",
    showSpectatorsTooltipMore: "show-spectators-tooltip-more"
};

/* components/tooltip.tsx */
const Tooltip = Components.Tooltip;

function SpectatorList({ spectators, showTitle }) {
    const compact = Hooks.useStateFromStores([Settings], () => Settings.get("compactMode", false));
    const { guildId, total, users } = spectators;
    const unknownCount = total - users.length;
    return BdApi.React.createElement(
        BdApi.React.Fragment,
        null,
        showTitle
            && BdApi.React.createElement(
                "div",
                { className: styles.showSpectatorsTooltipTitle },
                getLocalizedString(Strings.SPECTATORS, { numViewers: total })
            ),
        total > 0
            && (compact
                ? BdApi.React.createElement("div", null, getSpectatorSentence(spectators))
                : BdApi.React.createElement(
                      "div",
                      { className: styles.showSpectatorsTooltipList },
                      users.map(user =>
                          BdApi.React.createElement(
                              "div",
                              { key: user.id, className: styles.showSpectatorsTooltipRow },
                              BdApi.React.createElement("img", {
                                  className: styles.showSpectatorsTooltipAvatar,
                                  src: user.getAvatarURL(guildId, 40),
                                  alt: user.username
                              }),
                              getDisplayName(user, spectators)
                          )
                      ),
                      unknownCount > 0
                          && BdApi.React.createElement(
                              "div",
                              { className: styles.showSpectatorsTooltipMore },
                              "+",
                              getLocalizedString(Strings.NUM_USERS, { num: unknownCount })
                          )
                  ))
    );
}

function StreamTooltip() {
    const spectators = useSpectators();
    if (!spectators) return null;
    return BdApi.React.createElement(SpectatorList, { showTitle: true, spectators });
}

function StreamIconTooltip({ children }) {
    return BdApi.React.createElement(
        Tooltip,
        {
            text: BdApi.React.createElement(
                ErrorBoundary,
                { id: "ShowSpectators.Tooltip", mini: true },
                BdApi.React.createElement(StreamTooltip, null)
            )
        },
        props => BdApi.React.cloneElement(children, props)
    );
}

/* components/spectator.tsx */
if (!UserPopout) {
    const fallback = Settings.get("openFullProfile", false) ? "" : ", falling back to the full profile";
    Logger.error(`Failed to find UserPopout module${fallback}`);
}

function ProfilePopout({ user, spectators, openFullProfile, children }) {
    const ref = BdApi.React.useRef(null);
    const { guildId } = spectators;
    if (openFullProfile || !UserPopout) {
        return children({ onClick: () => UserProfileActions?.openUserProfileModal({ userId: user.id, guildId }) }, ref);
    }
    return BdApi.React.createElement(
        UserPopout,
        { targetElementRef: ref, userId: user.id, guildId, position: "top", align: "center" },
        popoutProps => children(popoutProps, ref)
    );
}

function SpectatorAvatar({ user, spectators, openFullProfile, animate }) {
    return BdApi.React.createElement(Tooltip, { text: getDisplayName(user, spectators) }, tooltipProps =>
        BdApi.React.createElement(ProfilePopout, { user, spectators, openFullProfile }, (props, ref) =>
            BdApi.React.createElement(
                Clickable,
                {
                    ...tooltipProps,
                    ...props,
                    className: AvatarStyles.clickableAvatar,
                    onClick: event => {
                        tooltipProps.onClick?.(event);
                        props.onClick?.(event);
                    }
                },
                BdApi.React.createElement(Avatar, {
                    ref,
                    "src": user.getAvatarURL(spectators.guildId, 48, animate),
                    "size": "SIZE_24",
                    "aria-label": user.username
                })
            )
        )
    );
}

function SpectatorName({ user, spectators, openFullProfile }) {
    return BdApi.React.createElement(ProfilePopout, { user, spectators, openFullProfile }, (props, ref) =>
        BdApi.React.createElement(
            Clickable,
            { ...props, tag: "span", className: styles$1.showSpectatorsName },
            BdApi.React.createElement("span", { ref }, getDisplayName(user, spectators))
        )
    );
}

/* components/panel.tsx */
const { Text } = Components;
const MAX_AVATARS = 12;

function SpectatorAvatars({ spectators, openFullProfile }) {
    const isFocused = Hooks.useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const { total, users } = spectators;
    const shownCount = users.length === MAX_AVATARS ? MAX_AVATARS : Math.min(users.length, MAX_AVATARS - 1);
    const hidden = { ...spectators, users: users.slice(shownCount), total: total - shownCount };
    return BdApi.React.createElement(UserSummaryItem, {
        className: styles$2.showSpectatorsPanelContent,
        users,
        count: total,
        renderIcon: false,
        max: MAX_AVATARS,
        renderUser: user =>
            BdApi.React.createElement(SpectatorAvatar, {
                key: user.id,
                user,
                spectators,
                openFullProfile,
                animate: isFocused
            }),
        renderMoreUsers: () =>
            hidden.total > 0
            && BdApi.React.createElement(
                Tooltip,
                { text: BdApi.React.createElement(SpectatorList, { spectators: hidden }) },
                props =>
                    BdApi.React.createElement("div", { ...props, className: AvatarStyles.moreUsers }, "+", hidden.total)
            )
    });
}

function Panel() {
    const openFullProfile = Hooks.useStateFromStores([Settings], () => Settings.get("openFullProfile", false));
    const compact = Hooks.useStateFromStores([Settings], () => Settings.get("compactMode", false));
    const spectators = useSpectators();
    if (!spectators) return null;
    const { streamer, total } = spectators;
    return BdApi.React.createElement(
        "div",
        { className: styles$2.showSpectatorsPanel },
        BdApi.React.createElement(
            Text,
            { size: Text.Sizes.SIZE_16 },
            streamer && `${getDisplayName(streamer, spectators)}'s `,
            getLocalizedString(Strings.SPECTATORS, { numViewers: total })
        ),
        total > 0
            && (compact
                ? BdApi.React.createElement(
                      Text,
                      { className: styles$2.showSpectatorsPanelContent },
                      getSpectatorSentence(spectators, user =>
                          BdApi.React.createElement(SpectatorName, {
                              key: user.id,
                              user,
                              spectators,
                              openFullProfile
                          })
                      )
                  )
                : BdApi.React.createElement(SpectatorAvatars, { spectators, openFullProfile }))
    );
}

function SpectatorsPanel() {
    const showPanel = Hooks.useStateFromStores([Settings], () => Settings.get("showPanel", true));
    return showPanel ? BdApi.React.createElement(Panel, null) : null;
}

/* settings.json */
const items = [
    {
        type: "switch",
        name: "Show Spectators Panel",
        note: "Shows a new panel with the spectators",
        id: "showPanel",
        value: true
    },
    {
        type: "switch",
        name: "Open Full Profile",
        note: "Opens the full profile instead of the small user popout when clicking on a spectator",
        id: "openFullProfile",
        value: false
    },
    {
        type: "switch",
        name: "Compact Mode",
        note: "Shows up to 3 spectator names instead of avatars",
        id: "compactMode",
        value: false
    },
    {
        type: "switch",
        name: "Show Watched Stream's Spectators",
        note: "Shows the spectators of the stream you're watching when you're not streaming yourself",
        id: "showWatchedStream",
        value: true
    }
];

const SettingsItems = {
    items: items
};

/* index.tsx */
class ShowSpectators {
    start() {
        Styles.load();
        showChangelog(manifest);
        this.patchStreamIcon();
        this.patchPanel();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    patchStreamIcon() {
        if (!StreamIcon) return Logger.error("Failed to find StreamIcon module");
        Patcher.after(...StreamIcon, (_, __, res) => {
            if (!BdApi.React.isValidElement(res)) return;
            return BdApi.React.createElement(StreamIconTooltip, null, res);
        });
    }
    patchPanel() {
        if (!AccountPanelSections) return Logger.error("Failed to find AccountPanelSections module");
        Patcher.after(...AccountPanelSections, (_, args, res) => {
            const [{ value }] = args;
            if (!value?.length || !value.every(location => location === "rtc panel")) return;
            const sections = res?.props?.children?.props?.children;
            if (!Array.isArray(sections) || sections.some(section => section?.key === "ShowSpectators")) return;
            sections.unshift(
                BdApi.React.createElement(
                    ErrorBoundary,
                    { key: "ShowSpectators", id: "ShowSpectators.Panel" },
                    BdApi.React.createElement(SpectatorsPanel, null)
                )
            );
        });
    }
    getSettingsPanel() {
        return BdApi.React.createElement(SettingsPanel, { items: SettingsItems.items });
    }
}

module.exports = ShowSpectators;
