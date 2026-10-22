/**
 * @name ShowSpectators
 * @version 1.1.0
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
    version: "1.1.0",
    description: "Shows you who's spectating your stream under the screenshare panel",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ShowSpectators",
    changelog: {
        date: "2026-10-19",
        changes: [
            {
                type: "added",
                title: "Choose between popout and full profile",
                items: [
                    "Clicking on a spectator now opens the small user popout, just like in the member list",
                    'Prefer the full profile? Turn on the new "Open Full Profile" option in the plugin settings'
                ]
            },
            {
                type: "fixed",
                title: "Opening profiles works again",
                items: ["Fixed clicking on a spectator not opening their profile"]
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

/* ../../common/i18n/index.ts */
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

/* components/style.scss */
Styles.sheets.push(
    "/* components/style.scss */",
    `.spectators-panel {
  padding: 8px;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}
.spectators-panel .spectators {
  margin-top: 4px;
  padding-bottom: 4px;
}`
);

/* components/spectators.jsx */
const { Flex, Text, Tooltip } = Components;
const ApplicationStreamingStore = Webpack.getStore("ApplicationStreamingStore");
const AvatarStyles = Webpack.getByKeys("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar");
const Clickable = Webpack.getByStrings("this.context?this.renderNonInteractive():", { searchExports: true });
const openUserProfileModal = Webpack.getByStrings('type:"USER_PROFILE_MODAL_OPEN"', { searchExports: true });
const RelationshipStore = Webpack.getStore("RelationshipStore");
const UserStore = Webpack.getStore("UserStore");
const UserSummaryItem = Webpack.getByStrings("defaultRenderUser", "showDefaultAvatarsForNullUsers");

const { UserPopout } = Webpack.getMangled(['type:"popout",withMutualGuilds', "disableUserProfileLink"], {
    UserPopout: x => x?.$$typeof === Symbol.for("react.memo")
});

const Strings = {
    SPECTATORS: "BR7Tno",
    NUM_USERS: "3uHFUR"
};

const getDisplayName = user => RelationshipStore.getNickname(user.id) || user.globalName || user.username;

function SpectatorsTooltip({ spectatorIds, guildId, noTitle }) {
    if (!spectatorIds && !guildId) {
        const activeStream = Hooks.useStateFromStores([ApplicationStreamingStore], () =>
            ApplicationStreamingStore.getCurrentUserActiveStream()
        );
        if (!activeStream) return null;
        spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
        guildId = activeStream.guildId;
    }
    let unknownSpectators = 0;
    const spectators = spectatorIds
        .map(id => UserStore.getUser(id))
        .filter(user => Boolean(user) || unknownSpectators++);
    return BdApi.React.createElement(
        BdApi.React.Fragment,
        null,
        !noTitle
            && BdApi.React.createElement(
                Text,
                { size: Text.Sizes.SIZE_16 },
                getLocalizedString(Strings.SPECTATORS, { numViewers: spectatorIds.length })
            ),
        spectators.length > 0
            && BdApi.React.createElement(
                Flex,
                { direction: Flex.Direction.VERTICAL, style: { alignItems: "center", gap: 6, marginTop: "8px" } },
                spectators.map(user =>
                    BdApi.React.createElement(
                        Flex,
                        { style: { alignContent: "center", gap: 6 } },
                        BdApi.React.createElement("img", {
                            src: user.getAvatarURL(guildId),
                            style: { borderRadius: 8, height: 16, width: 16 }
                        }),
                        getDisplayName(user)
                    )
                ),
                !!unknownSpectators
                    && BdApi.React.createElement(
                        Flex,
                        { style: { alignContent: "center" } },
                        BdApi.React.createElement(
                            Text,
                            null,
                            "+",
                            getLocalizedString(Strings.NUM_USERS, { num: unknownSpectators })
                        )
                    )
            )
    );
}

function SpectatorAvatar({ user, guildId }) {
    const avatarRef = BdApi.React.useRef(null);
    const prefersFullProfile = Hooks.useStateFromStores([Settings], () => Settings.get("openFullProfile", false));
    const showFullProfile = prefersFullProfile || !UserPopout;
    const renderAvatar = props =>
        BdApi.React.createElement(
            Clickable,
            { ...props, className: AvatarStyles.clickableAvatar },
            BdApi.React.createElement("img", {
                ref: avatarRef,
                className: AvatarStyles.avatar,
                src: user.getAvatarURL(void 0, 80, true),
                alt: user.username,
                title: user.username
            })
        );
    return BdApi.React.createElement(Tooltip, { text: getDisplayName(user) }, tooltipProps =>
        showFullProfile
            ? renderAvatar({
                  ...tooltipProps,
                  onClick: () => {
                      if (!UserPopout) {
                          Logger.error("Failed to find UserPopout module, falling back to the full profile");
                      }
                      openUserProfileModal?.({ userId: user.id, guildId });
                  }
              })
            : BdApi.React.createElement(
                  UserPopout,
                  {
                      targetElementRef: avatarRef,
                      userId: user.id,
                      guildId,
                      position: "top",
                      align: "center"
                  },
                  popoutProps => renderAvatar({ ...tooltipProps, ...popoutProps })
              )
    );
}

function SpectatorsPanel() {
    const activeStream = Hooks.useStateFromStores([ApplicationStreamingStore], () =>
        ApplicationStreamingStore.getCurrentUserActiveStream()
    );
    if (!activeStream || !Settings.get("showPanel", true)) return null;
    let unknownSpectators = 0;
    const spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
    const spectators = spectatorIds
        .map(id => UserStore.getUser(id))
        .filter(user => Boolean(user) || unknownSpectators++);
    return BdApi.React.createElement(
        "div",
        { className: "spectators-panel" },
        BdApi.React.createElement(
            Text,
            { size: Text.Sizes.SIZE_16 },
            getLocalizedString(Strings.SPECTATORS, { numViewers: spectatorIds.length })
        ),
        spectatorIds.length
            ? BdApi.React.createElement(UserSummaryItem, {
                  className: "spectators",
                  style: {
                      marginTop: "4px",
                      paddingBottom: "4px"
                  },
                  users: spectators,
                  count: spectatorIds.length,
                  renderIcon: false,
                  max: 12,
                  showDefaultAvatarsForNullUsers: true,
                  renderUser: user =>
                      BdApi.React.createElement(SpectatorAvatar, { user, guildId: activeStream.guildId }),
                  renderMoreUsers: (label, count) => {
                      const sliced = spectators.slice(-count);
                      return BdApi.React.createElement(
                          Tooltip,
                          {
                              text: BdApi.React.createElement(SpectatorsTooltip, {
                                  noTitle: true,
                                  guildId: activeStream.guildId,
                                  spectatorIds: sliced.map(user => user.id)
                              })
                          },
                          props =>
                              BdApi.React.createElement(
                                  "div",
                                  { ...props, className: AvatarStyles.moreUsers },
                                  "+",
                                  sliced.length
                              )
                      );
                  }
              })
            : null
    );
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
    }
];

const SettingsItems = {
    items: items
};

/* index.jsx */
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
        const StreamIcon = Webpack.getBySource(".STATUS_SCREENSHARE");
        if (!StreamIcon) return Logger.error("Failed to find StreamIcon module");
        Patcher.after(StreamIcon, "A", (_, __, res) => {
            const children = res.props.children;
            res.props.children = [
                BdApi.React.createElement(
                    Components.Tooltip,
                    { text: BdApi.React.createElement(SpectatorsTooltip, null) },
                    props => children.map(child => BdApi.React.cloneElement(child, props))
                )
            ];
        });
    }
    patchPanel() {
        const AccountPanelSections = Webpack.getById("688810");
        if (!AccountPanelSections) return Logger.error("Failed to find AccountPanelSections module");
        Patcher.after(AccountPanelSections, "f5", (_, __, res) => {
            if (!res.props.value.every(v => v === "rtc panel")) return;
            res.props.children.props.children.unshift(BdApi.React.createElement(SpectatorsPanel, null));
        });
    }
    getSettingsPanel() {
        return BdApi.React.createElement(SettingsPanel, { items: SettingsItems.items });
    }
}

module.exports = ShowSpectators;
