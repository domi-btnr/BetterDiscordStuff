/**
 * @name FriendCodes
 * @version 1.3.0
 * @description Generate FriendCodes to easily add friends
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/FriendCodes
 */

"use strict";

/* @manifest */
const manifest = {
    $schema: "../../common/Schemas/manifest.schema.json",
    name: "FriendCodes",
    version: "1.3.0",
    description: "Generate FriendCodes to easily add friends",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/FriendCodes",
    changelog: {
        date: "2026-10-23",
        changes: [
            {
                type: "added",
                title: "Now speaking German 🇩🇪",
                items: [
                    "FriendCodes follows your Discord language and is now fully translated into German. Switch languages and it updates right away"
                ]
            },
            {
                type: "fixed",
                title: "No more endless loading",
                items: [
                    'The panel no longer gets stuck on "Loading..." when Discord doesn\'t respond. You can retry instead'
                ]
            },
            {
                type: "improved",
                title: "Feels like part of Discord",
                items: [
                    "Rewrote the plugin from the ground up, making it lighter and less likely to break when Discord updates",
                    "The panel got a cleaner look that fits right in with the rest of the Add Friend page",
                    "Creating or revoking friend codes now tells you when something goes wrong, in the panel and in the slash commands"
                ]
            }
        ]
    }
};

/* @api */
const { Commands, Components, Data, DOM, Hooks, Logger, Patcher, UI, Webpack } = new BdApi(manifest.name);

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
const { Text: Text$3 } = Components;

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
        Text$3,
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

/* locales/de.json */
const panel$1 = {
    title: "Deine Freundescodes",
    description: "Teile einen Freundescode, damit andere dich hinzufügen können, ohne deinen Benutzernamen zu kennen.",
    count: "Freundescodes — {{count}}",
    create: "Freundescode erstellen",
    revokeAll: "Alle löschen",
    empty: "Du hast noch keine Freundescodes.",
    loadFailed: "Deine Freundescodes konnten nicht geladen werden.",
    retry: "Erneut versuchen"
};

const card$1 = {
    details: "Läuft <expires/> ab • {{uses}}/{{maxUses}} Verwendungen",
    copy: "Kopieren",
    copied: "Kopiert"
};

const errors$1 = {
    create: "Der Freundescode konnte nicht erstellt werden. Bitte versuche es später erneut.",
    revoke: "Deine Freundescodes konnten nicht gelöscht werden. Bitte versuche es später erneut."
};

const commands$1 = {
    create: {
        description: "Erstellt einen Freundescode",
        ephemeral: "Ob nur du die Nachricht sehen kannst",
        message: "Max. Verwendungen: {{maxUses}}\nLäuft ab: {{expires}}\n{{link}}"
    },
    revoke: {
        description: "Löscht alle deine Freundescodes",
        revoked_one: "{{count}} Freundescode gelöscht.",
        revoked_other: "{{count}} Freundescodes gelöscht."
    }
};

const de$1 = {
    panel: panel$1,
    card: card$1,
    errors: errors$1,
    commands: commands$1
};

/* locales/en.json */
const panel = {
    title: "Your Friend Codes",
    description: "Share a friend code so others can add you without knowing your username.",
    count: "Friend Codes — {{count}}",
    create: "Create Friend Code",
    revokeAll: "Revoke All",
    empty: "You don't have any friend codes yet.",
    loadFailed: "Couldn't load your friend codes.",
    retry: "Try Again"
};

const card = {
    details: "Expires <expires/> • {{uses}}/{{maxUses}} uses",
    copy: "Copy",
    copied: "Copied"
};

const errors = {
    create: "Couldn't create a friend code. Please try again later.",
    revoke: "Couldn't revoke your friend codes. Please try again later."
};

const commands = {
    create: {
        description: "Create a friend code",
        ephemeral: "Whether only you can see the message",
        message: "Max Uses: {{maxUses}}\nExpires: {{expires}}\n{{link}}"
    },
    revoke: {
        description: "Revoke all your friend codes",
        revoked_one: "Revoked {{count}} friend code.",
        revoked_other: "Revoked {{count}} friend codes."
    }
};

const en$1 = {
    panel: panel,
    card: card,
    errors: errors,
    commands: commands
};

/* modules/i18n.ts */
const {
    t,
    useTranslation: useTranslation$1,
    Trans: Trans$1
} = createI18n({
    resources: { en: en$1, de: de$1 },
    discord: {
        "card.copy": "OpuAlK",
        "card.copied": "q30c5i",
        "panel.retry": "TdQXA8"
    }
});

/* modules/webpack.ts */
const { Filters } = Webpack;

const Modules = Webpack.getBulkKeyed({
    InviteModule: {
        filter: Filters.byKeys("createFriendInvite", "getAllFriendInvites", "revokeFriendInvites"),
        cacheId: "FriendCodes.InviteModule"
    },
    TabBar: {
        filter: Filters.byKeys("Header", "Item", "Separator", "Panel"),
        searchExports: true,
        cacheId: "FriendCodes.TabBar"
    }
});

const { InviteModule, TabBar } = Modules;

/* commands/createFriendCode.ts */
const {
    Types: { OptionTypes }
} = Commands;

function createFriendCode() {
    return {
        id: "FC-Create",
        name: "create-friend-code",
        description: t("commands.create.description"),
        options: [
            {
                type: OptionTypes.BOOLEAN,
                name: "ephemeral",
                description: t("commands.create.ephemeral"),
                required: false
            }
        ],
        execute: async (options, { channel }) => {
            try {
                const invite = await InviteModule.createFriendInvite();
                const msg = t("commands.create.message", {
                    maxUses: invite.max_uses,
                    expires: `<t:${new Date(invite.expires_at).getTime() / 1e3}:R>`,
                    link: `https://discord.gg/${invite.code}`
                });
                if (options.find(o => o.name === "ephemeral")?.value ?? true) return { content: msg };
                MessageActions.sendMessage(channel.id, { content: msg }, void 0, { location: "chat_input" });
            } catch (err) {
                Logger.error("Failed to create a Friend Code", err);
                return { content: t("errors.create") };
            }
        }
    };
}

/* commands/revokeAllFriendCodes.ts */
function revokeAllFriendCodes() {
    return {
        id: "FC-RevokeAll",
        name: "revoke-all-friend-codes",
        description: t("commands.revoke.description"),
        execute: async () => {
            try {
                const invites = await InviteModule.getAllFriendInvites();
                await InviteModule.revokeFriendInvites();
                return { content: t("commands.revoke.revoked", { count: invites.length }) };
            } catch (err) {
                Logger.error("Failed to revoke your Friend Codes", err);
                return { content: t("errors.revoke") };
            }
        }
    };
}

/* commands/index.ts */
function getCommands() {
    return [createFriendCode(), revokeAllFriendCodes()];
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
const { Button: Button$2, ErrorBoundary: BdErrorBoundary, Text: Text$2 } = Components;

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
        Button$2,
        { size: Button$2.Sizes.SMALL, color: copied ? Button$2.Colors.GREEN : Button$2.Colors.PRIMARY, onClick: copy },
        t(copied ? "copied" : "copy")
    );
}

function MiniFallback() {
    const { t } = useTranslation();
    const label = t("mini", { plugin: manifest.name });
    return BdApi.React.createElement(
        "span",
        { "className": styles$2.errorBoundaryMini, "role": "img", "aria-label": label, "title": label },
        BdApi.React.createElement(ErrorIcon, { width: "16", height: "16" })
    );
}

function Fallback({ id, error, onRetry }) {
    const { t } = useTranslation();
    return BdApi.React.createElement(
        "div",
        { className: styles$2.errorBoundary, role: "alert" },
        BdApi.React.createElement(
            "div",
            { className: styles$2.errorBoundaryContent },
            BdApi.React.createElement(
                Text$2,
                { size: Text$2.Sizes.SIZE_16, color: Text$2.Colors.HEADER_PRIMARY, strong: true },
                t("title")
            ),
            BdApi.React.createElement(
                Text$2,
                { color: Text$2.Colors.MUTED },
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
            BdApi.React.createElement(Button$2, { size: Button$2.Sizes.SMALL, onClick: onRetry }, t("retry"))
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

/* modules/store.ts */
let invites = [];
let loaded = false;
let failed = false;
const uniqueByCode = list => [...new Map(list.map(invite => [invite.code, invite])).values()];

const FriendInvitesStore = new (class FriendInvitesStore2 extends Flux.Store {
    constructor() {
        super(Dispatcher, {
            FRIEND_INVITES_FETCH_RESPONSE: ({ invites: fetched }) => {
                invites = uniqueByCode(fetched);
                loaded = true;
                failed = false;
            },
            FRIEND_INVITE_CREATE_SUCCESS: ({ invite }) => {
                invites = uniqueByCode([...invites, invite]);
            },
            FRIEND_INVITE_REVOKE_SUCCESS: () => {
                invites = [];
            }
        });
    }
    getInvites() {
        return invites;
    }
    hasLoaded() {
        return loaded;
    }
    hasFailed() {
        return failed;
    }
})();

function fetchInvites() {
    failed = false;
    FriendInvitesStore.emitChange();
    return InviteModule.getAllFriendInvites().catch(err => {
        Logger.error("Failed to fetch Friend Codes", err);
        failed = true;
        FriendInvitesStore.emitChange();
    });
}

/* components/codeCard.scss */
Styles.sheets.push(
    "/* components/codeCard.scss */",
    `.friend-codes-row {
  gap: 16px;
  padding: 12px 16px;
}
.friend-codes-row + .friend-codes-row {
  border-top: 1px solid var(--border-subtle);
}
.friend-codes-row .friend-codes-row-details {
  margin-top: 2px;
}`
);
const styles$1 = {
    friendCodesRow: "friend-codes-row",
    friendCodesRowDetails: "friend-codes-row-details"
};

/* components/copyButton.tsx */
const { Button: Button$1 } = Components;

function CopyButton({ copyText, copiedText, onClick }) {
    const [copied, setCopied] = BdApi.React.useState(false);
    const handleButtonClick = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1e3);
        onClick();
    };
    return BdApi.React.createElement(
        Button$1,
        {
            onClick: handleButtonClick,
            color: copied ? Button$1.Colors.GREEN : Button$1.Colors.BRAND,
            size: Button$1.Sizes.SMALL,
            look: Button$1.Looks.FILLED
        },
        copied ? copiedText : copyText
    );
}

/* components/codeCard.tsx */
const { Flex: Flex$1, Text: Text$1 } = Components;

function FriendCodeRow({ invite }) {
    const { t } = useTranslation$1();
    const expiresAt = new Date(invite.expires_at).getTime() / 1e3;
    return BdApi.React.createElement(
        Flex$1,
        { className: styles$1.friendCodesRow, align: Flex$1.Align.CENTER, justify: Flex$1.Justify.BETWEEN },
        BdApi.React.createElement(
            "div",
            null,
            BdApi.React.createElement(
                Text$1,
                { tag: "h4", size: Text$1.Sizes.SIZE_16, color: Text$1.Colors.HEADER_PRIMARY, strong: true },
                invite.code
            ),
            BdApi.React.createElement(
                Text$1,
                { className: styles$1.friendCodesRowDetails, color: Text$1.Colors.MUTED },
                BdApi.React.createElement(Trans$1, {
                    i18nKey: "card.details",
                    values: { uses: invite.uses, maxUses: invite.max_uses },
                    components: {
                        expires: BdApi.React.createElement(
                            BdApi.React.Fragment,
                            null,
                            Parser.parse(`<t:${expiresAt}:R>`)
                        )
                    }
                })
            )
        ),
        BdApi.React.createElement(CopyButton, {
            copyText: t("card.copy"),
            copiedText: t("card.copied"),
            onClick: () => DiscordNative.clipboard.copy(`https://discord.gg/${invite.code}`)
        })
    );
}

/* components/panel.scss */
Styles.sheets.push(
    "/* components/panel.scss */",
    `.friend-codes-panel {
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-subtle);
}
.friend-codes-panel .friend-codes-panel-header {
  flex-wrap: wrap;
  gap: 12px 16px;
}
.friend-codes-panel .friend-codes-panel-header .friend-codes-panel-heading {
  flex: 1 1 280px;
  min-width: 0;
}
.friend-codes-panel .friend-codes-panel-header .friend-codes-panel-heading .friend-codes-panel-description {
  margin-top: 8px;
}
.friend-codes-panel .friend-codes-panel-header .friend-codes-panel-actions {
  flex: 0 0 auto;
  width: auto;
  gap: 8px;
}
.friend-codes-panel .friend-codes-panel-header .friend-codes-panel-revoke.bd-button-outlined {
  border-color: var(--status-danger);
  color: var(--status-danger);
}
.friend-codes-panel .friend-codes-panel-header .friend-codes-panel-revoke.bd-button-outlined:hover:not(:disabled) {
  background-color: var(--status-danger);
  color: var(--white-500, #fff);
}
.friend-codes-panel .friend-codes-panel-count {
  margin: 20px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.friend-codes-panel .friend-codes-panel-list {
  max-height: 40vh;
  overflow-y: auto;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background-color: var(--background-base-lower);
}
.friend-codes-panel .friend-codes-panel-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.friend-codes-panel .friend-codes-panel-list::-webkit-scrollbar-track {
  border: 2px solid var(--scrollbar-thin-track);
  background-color: var(--scrollbar-thin-track);
}
.friend-codes-panel .friend-codes-panel-list::-webkit-scrollbar-thumb {
  min-height: 40px;
  border: 2px solid transparent;
  border-radius: 4px;
  background-color: var(--scrollbar-thin-thumb);
  background-clip: padding-box;
}
.friend-codes-panel .friend-codes-panel-list::-webkit-scrollbar-corner {
  background-color: transparent;
}
.no-webkit-scrollbar .friend-codes-panel .friend-codes-panel-list {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thin-thumb) var(--scrollbar-thin-track);
}
.friend-codes-panel .friend-codes-panel-list .friend-codes-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  text-align: center;
}`
);
const styles = {
    friendCodesPanel: "friend-codes-panel",
    friendCodesPanelHeader: "friend-codes-panel-header",
    friendCodesPanelHeading: "friend-codes-panel-heading",
    friendCodesPanelDescription: "friend-codes-panel-description",
    friendCodesPanelActions: "friend-codes-panel-actions",
    friendCodesPanelRevoke: "friend-codes-panel-revoke",
    friendCodesPanelCount: "friend-codes-panel-count",
    friendCodesPanelList: "friend-codes-panel-list",
    friendCodesPanelEmpty: "friend-codes-panel-empty"
};

/* components/panel.tsx */
const { Button, Flex, Spinner, Text } = Components;

function PanelContent() {
    const { t } = useTranslation$1();
    const invites = Hooks.useStateFromStores([FriendInvitesStore], () => FriendInvitesStore.getInvites());
    const loaded = Hooks.useStateFromStores([FriendInvitesStore], () => FriendInvitesStore.hasLoaded());
    const failed = Hooks.useStateFromStores([FriendInvitesStore], () => FriendInvitesStore.hasFailed());
    if (!loaded && failed) {
        return BdApi.React.createElement(
            "div",
            { className: styles.friendCodesPanelEmpty },
            BdApi.React.createElement(Text, { color: Text.Colors.MUTED }, t("panel.loadFailed")),
            BdApi.React.createElement(Button, { size: Button.Sizes.SMALL, onClick: fetchInvites }, t("panel.retry"))
        );
    }
    if (!loaded) {
        return BdApi.React.createElement(
            "div",
            { className: styles.friendCodesPanelEmpty },
            BdApi.React.createElement(Spinner, null)
        );
    }
    if (!invites.length) {
        return BdApi.React.createElement(
            "div",
            { className: styles.friendCodesPanelEmpty },
            BdApi.React.createElement(Text, { color: Text.Colors.MUTED }, t("panel.empty"))
        );
    }
    return invites.map(invite => BdApi.React.createElement(FriendCodeRow, { key: invite.code, invite }));
}

function PanelBody() {
    const { t } = useTranslation$1();
    const count = Hooks.useStateFromStores([FriendInvitesStore], () => FriendInvitesStore.getInvites().length);
    const [pending, setPending] = BdApi.React.useState(false);
    BdApi.React.useEffect(() => {
        fetchInvites();
    }, []);
    const runRequest = (request, error) => {
        setPending(true);
        request()
            .catch(err => {
                Logger.error(error, err);
                UI.showToast(t(error), { type: "error" });
            })
            .finally(() => setPending(false));
    };
    return BdApi.React.createElement(
        BdApi.React.Fragment,
        null,
        BdApi.React.createElement(
            Flex,
            { className: styles.friendCodesPanelHeader, align: Flex.Align.START, justify: Flex.Justify.BETWEEN },
            BdApi.React.createElement(
                "div",
                { className: styles.friendCodesPanelHeading },
                BdApi.React.createElement(
                    Text,
                    { tag: "h2", size: Text.Sizes.SIZE_20, color: Text.Colors.HEADER_PRIMARY, strong: true },
                    t("panel.title")
                ),
                BdApi.React.createElement(
                    Text,
                    { className: styles.friendCodesPanelDescription },
                    t("panel.description")
                )
            ),
            BdApi.React.createElement(
                Flex,
                { className: styles.friendCodesPanelActions, justify: Flex.Justify.END },
                BdApi.React.createElement(
                    Button,
                    {
                        className: styles.friendCodesPanelRevoke,
                        color: Button.Colors.RED,
                        look: Button.Looks.OUTLINED,
                        size: Button.Sizes.SMALL,
                        disabled: pending || !count,
                        onClick: () => runRequest(InviteModule.revokeFriendInvites, "errors.revoke")
                    },
                    t("panel.revokeAll")
                ),
                BdApi.React.createElement(
                    Button,
                    {
                        size: Button.Sizes.SMALL,
                        disabled: pending,
                        onClick: () => runRequest(InviteModule.createFriendInvite, "errors.create")
                    },
                    t("panel.create")
                )
            )
        ),
        BdApi.React.createElement(
            Text,
            {
                tag: "h3",
                className: styles.friendCodesPanelCount,
                size: Text.Sizes.SIZE_12,
                color: Text.Colors.HEADER_SECONDARY,
                strong: true
            },
            t("panel.count", { count })
        ),
        BdApi.React.createElement(
            "div",
            { className: styles.friendCodesPanelList },
            BdApi.React.createElement(PanelContent, null)
        )
    );
}

function FriendCodesPanel() {
    return BdApi.React.createElement(
        "header",
        { className: styles.friendCodesPanel },
        BdApi.React.createElement(
            ErrorBoundary,
            { id: "FriendCodes.Panel" },
            BdApi.React.createElement(PanelBody, null)
        )
    );
}

/* index.tsx */
function AddFriendPage({ page, ...props }) {
    const res = page(props);
    const children = res?.props?.children;
    if (Array.isArray(children)) {
        children.splice(1, 0, BdApi.React.createElement(FriendCodesPanel, { key: "FriendCodes" }));
    }
    return res;
}

class FriendCodes {
    unsubscribeLocale;
    unpatchAddFriendPage;
    start() {
        Styles.load();
        showChangelog(manifest);
        this.unpatchAddFriendPage = this.patchAddFriendPage();
        this.registerCommands();
        this.unsubscribeLocale = onLocaleChange(() => this.registerCommands());
    }
    stop() {
        this.unsubscribeLocale?.();
        Commands.unregisterAll();
        this.unpatchAddFriendPage?.();
        Patcher.unpatchAll();
        Styles.unload();
    }
    registerCommands() {
        Commands.unregisterAll();
        getCommands().forEach(command => Commands.register(command));
    }
    patchAddFriendPage() {
        if (!TabBar) {
            Logger.error("Failed to find TabBar module");
            return;
        }
        const unpatch = Patcher.after(TabBar, "Panel", (_, [{ id }], res) => {
            const page = res?.props?.children;
            if (id !== "ADD_FRIEND" || typeof page?.type !== "function" || page.type === AddFriendPage) return;
            res.props.children = BdApi.React.createElement(AddFriendPage, {
                key: page.key,
                page: page.type,
                ...page.props
            });
        });
        rerenderComponent(TabBar.Panel);
        return () => {
            unpatch?.();
            rerenderComponent(TabBar?.Panel);
        };
    }
}

module.exports = FriendCodes;
