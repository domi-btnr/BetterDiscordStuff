/**
 * @name MessagePeek
 * @version 1.2.7
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
    version: "1.2.7",
    description: "See the last message in a Channel like on mobile",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/MessagePeek",
    changelog: {
        date: "2026-09-05",
        changes: [
            {
                type: "fixed",
                title: "Fixed",
                items: ["Updated the Plugin to work with the latest Discord update"]
            },
            {
                type: "progress",
                title: "Known broken Features",
                items: [
                    "Removed the option to show timestamps in the DM list as it doesn't work and I don't have the time to fix it right now"
                ]
            }
        ]
    }
};

/* @api */
const { Components, Data, DOM, Hooks, Patcher, ReactUtils, UI, Utils, Webpack } = new BdApi(manifest.name);

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

function resolveMessage(resources, key, options = {}, discordKey) {
    const discordMessage = discordKey && getDiscordMessage(discordKey, options);
    if (discordMessage) return discordMessage;
    for (const language of getLanguages(resources)) {
        const resource = resources[language];
        if (options.count != null) {
            const rule = getPluralRules(language).select(options.count);
            const plural =
                (options.count === 0 ? getPath(resource, `${key}_zero`) : void 0)
                ?? getPath(resource, `${key}_${rule}`)
                ?? getPath(resource, `${key}_other`);
            if (plural != null) return plural;
        }
        const message = getPath(resource, key);
        if (message != null) return message;
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
    const resolve = (key, options) => resolveMessage(allResources, key, options, discordKeys[key]);
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

/* components/styles.scss */
Styles.sheets.push(
    "/* components/styles.scss */",
    `a[href^="/channels/@me/"] [class^=layout] {
  min-height: 42px;
  max-height: 50px;
  height: unset;
}`
);

/* components/messagePeek.jsx */
const MessageStore = Webpack.getStore("MessageStore");

function MessagePeek$1({ channelId, timestampOnly }) {
    if (!channelId) return null;
    const lastMessage = Hooks.useStateFromStores([MessageStore], () => MessageStore.getMessages(channelId)?.last());
    if (!lastMessage) return null;
    if (!timestampOnly) {
        const attachmentCount = lastMessage.attachments.length;
        const content =
            lastMessage.content
            || lastMessage.embeds?.[0]?.rawDescription
            || (lastMessage.stickerItems.length && "Sticker")
            || (attachmentCount && `${attachmentCount} attachment${attachmentCount > 1 ? "s" : ""}`);
        if (!content) return null;
        const charLimit = Settings.get("tooltipCharacterLimit", 256);
        const authorName =
            lastMessage.author.email && Settings.get("showYourselfAsYou", true)
                ? "You"
                : lastMessage.author["globalName"] || lastMessage.author["username"];
        return BdApi.React.createElement(
            "div",
            {
                style: {
                    marginBottom: "2px",
                    marginTop: "-2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }
            },
            BdApi.React.createElement(
                Components.Tooltip,
                {
                    text:
                        content.length > charLimit
                            ? Parser.parse(content.slice(0, charLimit).trim() + "\u2026")
                            : Parser.parse(content)
                },
                props =>
                    BdApi.React.createElement(
                        "div",
                        {
                            ...props,
                            style: {
                                fontSize: "12px",
                                fontWeight: "var(--font-weight-medium)",
                                lineHeight: "16px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }
                        },
                        Settings.get("showAuthor", true) && `${authorName}: `,
                        Parser.parseInlineReply(content)
                    )
            )
        );
    } else {
        const now = Date.now();
        const dateTimeFormatter = new Intl.DateTimeFormat(getLocale(), {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        const units = [
            { unit: "s", ms: 1e3 },
            { unit: "m", ms: 1e3 * 60 },
            { unit: "h", ms: 1e3 * 60 * 60 },
            { unit: "d", ms: 1e3 * 60 * 60 * 24 },
            { unit: "w", ms: 1e3 * 60 * 60 * 24 * 7 },
            { unit: "mo", ms: 1e3 * 60 * 60 * 24 * 30 },
            { unit: "y", ms: 1e3 * 60 * 60 * 24 * 365 }
        ];
        const diffInMs = lastMessage.timestamp - now;
        let relativeTime = 0;
        let unit = "";
        for (let i = units.length - 1; i >= 0; i--) {
            const { unit: u, ms } = units[i];
            if (Math.abs(diffInMs) >= ms) {
                relativeTime = Math.floor(diffInMs / ms);
                unit = u;
                break;
            }
        }
        return BdApi.React.createElement(
            Components.Tooltip,
            { text: dateTimeFormatter.format(lastMessage.timestamp) },
            props =>
                BdApi.React.createElement(
                    "div",
                    {
                        ...props,
                        style: {
                            marginRight: "5px",
                            alignContent: "center",
                            color: "var(--channels-default)"
                        }
                    },
                    `${Math.abs(relativeTime)}${unit}`
                )
        );
    }
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
        note: "How many DM channels to preload. This makes an API request for each channel, so be careful with this setting",
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

/* index.jsx */
class MessagePeek {
    start() {
        if (Settings.get("preloadLimit", 10) > 30) Settings.set("preloadLimit", 10);
        showChangelog(manifest);
        this.patchDMs();
        this.patchGuildChannel();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    async patchDMs() {
        const ChannelContext = BdApi.React.createContext(null);
        const ChannelWrapper = await Webpack.waitForModule(
            Webpack.Filters.bySource("isMobile", 'location:"PrivateChannel"')
        );
        const NameWrapper = (await Webpack.waitForModule(Webpack.Filters.bySource("AvatarWithText"))).A;
        const ChannelClasses = await Webpack.waitForModule(Webpack.Filters.byKeys("channel", "decorator"));
        Patcher.after(ChannelWrapper, "Ay", (_, __, res) => {
            if (!Settings.get("showInDMs", true)) return;
            Patcher.after(res, "type", (_2, [props], res2) => {
                return BdApi.React.createElement(ChannelContext.Provider, { value: props.channel }, res2);
            });
        });
        Patcher.after(NameWrapper, "render", (_, __, res) => {
            const channel = BdApi.React.useContext(ChannelContext);
            if (!channel) return res;
            const nameWrapper = Utils.findInTree(res, e => e?.props?.className?.startsWith("content__"), {
                walkable: ["children", "props"]
            });
            if (!nameWrapper) return res;
            nameWrapper.props.children.push(BdApi.React.createElement(MessagePeek$1, { channelId: channel.id }));
        });
        const preload = Webpack.getByKeys("preload", "fetchChannel")?.preload;
        Webpack.getStore("ChannelStore")
            .getSortedPrivateChannels()
            .filter(
                channel => channel.lastMessageId && !Webpack.getStore("MessageStore").getMessages(channel.id)?.last()
            )
            .slice(0, Settings.get("preloadLimit", 10))
            .reduce((promise, channel, index) => {
                return promise.then(() => {
                    preload("@me", channel.id);
                    return new Promise(resolve => setTimeout(resolve, 125 + index * 125));
                });
            }, Promise.resolve());
        const ChannelWrapperElement = document.querySelector(`h2 + .${ChannelClasses.channel}`);
        if (ChannelWrapperElement) {
            const ChannelWrapperInstance = ReactUtils.getOwnerInstance(ChannelWrapperElement);
            if (ChannelWrapperInstance) ChannelWrapperInstance.forceUpdate();
        }
    }
    async patchGuildChannel() {
        const ChannelWrapper = await Webpack.waitForModule(
            Webpack.Filters.byComponentType(Webpack.Filters.byStrings("channel", "unread", ".ALL_MESSAGES"))
        );
        Patcher.after(ChannelWrapper, "render", (_, [{ channel }], res) => {
            if (!Settings.get("showInGuilds", true)) return;
            const nameWrapper = Utils.findInTree(res, e => e?.props?.className?.startsWith("name__"), {
                walkable: ["children", "props"]
            });
            if (!nameWrapper) return res;
            nameWrapper.props.children = [
                nameWrapper.props.children,
                BdApi.React.createElement(MessagePeek$1, { channelId: channel.id })
            ];
            if (!Settings.get("showTimestamp", true)) return;
            const innerWrapper = Utils.findInTree(res, e => e?.props?.className?.startsWith("linkTop"), {
                walkable: ["children", "props"]
            });
            if (!innerWrapper) return res;
            const children = innerWrapper.props.children;
            children.splice(
                children.length - 1,
                0,
                BdApi.React.createElement(MessagePeek$1, { channelId: channel.id, timestampOnly: true })
            );
        });
    }
    getSettingsPanel() {
        return BdApi.React.createElement(SettingsPanel, { items: SettingsItems.items });
    }
}

module.exports = MessagePeek;
