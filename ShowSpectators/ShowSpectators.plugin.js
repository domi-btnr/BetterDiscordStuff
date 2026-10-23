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

/* ../../common/i18n/discord.ts */
function getLocalizedString(key, values) {
    if (!values) return I18nModule.intl?.formatToPlainString(I18nModule.t[key]) ?? void 0;
    return I18nModule.intl?.format(I18nModule.t[key], values) ?? void 0;
}

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
