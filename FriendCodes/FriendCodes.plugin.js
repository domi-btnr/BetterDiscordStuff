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
    const message = I18nModule.t?.[key];
    if (!message) return;
    return I18nModule.intl?.formatToPlainString(message, values) || void 0;
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
    `.errorBoundary {
  align-items: center;
  background: #473c41;
  border: 2px solid #f04747;
  border-radius: 5px;
  padding: 5px;
  margin: 10px;
  color: #fff;
  font-size: 16px;
}
.errorBoundary .errorText {
  display: flex;
  flex-direction: column;
  gap: 5px;
}`
);

/* ../../common/ErrorBoundary/index.tsx */
const ErrorIcon = props =>
    BdApi.React.createElement(
        "svg",
        {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "#ddd",
            width: "24",
            height: "24",
            ...props
        },
        BdApi.React.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
        BdApi.React.createElement("path", {
            d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        })
    );

class ErrorBoundary extends BdApi.React.Component {
    state = { hasError: false, error: null, info: null };
    componentDidCatch(error, info) {
        this.setState({ error, info, hasError: true });
        Logger.error(
            `[ErrorBoundary:${this.props.id}] HI OVER HERE!! SHOW THIS SCREENSHOT TO THE DEVELOPER.
`,
            error
        );
    }
    render() {
        if (this.state.hasError) {
            return this.props.mini
                ? BdApi.React.createElement(ErrorIcon, { fill: "#f04747" })
                : BdApi.React.createElement(
                      "div",
                      { className: "errorBoundary" },
                      BdApi.React.createElement(
                          "div",
                          { className: "errorText" },
                          BdApi.React.createElement(
                              "span",
                              null,
                              "An error has occured while rendering ",
                              this.props.id,
                              "."
                          ),
                          BdApi.React.createElement(
                              "span",
                              null,
                              "Open console (",
                              BdApi.React.createElement("code", null, "CTRL + SHIFT + i / CMD + SHIFT + i"),
                              ') - Select the "Console" tab and screenshot the big red error.'
                          )
                      )
                  );
        } else return this.props.children;
    }
}

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

const de = {
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

const en = {
    panel: panel,
    card: card,
    errors: errors,
    commands: commands
};

/* modules/i18n.ts */
const { t, useTranslation, Trans } = createI18n({
    resources: { en, de },
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
    const { t } = useTranslation();
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
                BdApi.React.createElement(Trans, {
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
    const { t } = useTranslation();
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

function FriendCodesPanel() {
    const { t } = useTranslation();
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
        "header",
        { className: styles.friendCodesPanel },
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

/* index.tsx */
function AddFriendPage({ page, ...props }) {
    const res = page(props);
    const children = res?.props?.children;
    if (Array.isArray(children)) {
        children.splice(
            1,
            0,
            BdApi.React.createElement(
                ErrorBoundary,
                { key: "FriendCodes", id: "FriendCodes.Panel" },
                BdApi.React.createElement(FriendCodesPanel, null)
            )
        );
    }
    return res;
}

class FriendCodes {
    unsubscribeLocale;
    start() {
        Styles.load();
        showChangelog(manifest);
        this.patchAddFriendPage();
        this.registerCommands();
        this.unsubscribeLocale = onLocaleChange(() => this.registerCommands());
    }
    stop() {
        this.unsubscribeLocale?.();
        Commands.unregisterAll();
        Patcher.unpatchAll();
        Styles.unload();
    }
    registerCommands() {
        Commands.unregisterAll();
        getCommands().forEach(command => Commands.register(command));
    }
    patchAddFriendPage() {
        if (!TabBar) return Logger.error("Failed to find TabBar module");
        Patcher.after(TabBar, "Panel", (_, [{ id }], res) => {
            const page = res?.props?.children;
            if (id !== "ADD_FRIEND" || typeof page?.type !== "function" || page.type === AddFriendPage) return;
            res.props.children = BdApi.React.createElement(AddFriendPage, {
                key: page.key,
                page: page.type,
                ...page.props
            });
        });
    }
}

module.exports = FriendCodes;
