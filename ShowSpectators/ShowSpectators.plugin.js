/**
 * @name ShowSpectators
 * @version 1.0.6
 * @description Shows you who's spectating your stream under the screenshare panel
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ShowSpectators
 */

'use strict';

/* @manifest */
const manifest = {
    "$schema": "../common/Schemas/manifest.schema.json",
    "name": "ShowSpectators",
    "version": "1.0.6",
    "description": "Shows you who's spectating your stream under the screenshare panel",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ShowSpectators",
    "changelog": {
        "date": "2026-05-19",
        "changes": [{
            "type": "fixed",
            "title": "Plugin works again for everyone",
            "items": [
                "Fixed the plugin for users that have already the \"2026-05-rtc-connection-functional\" experiment"
            ]
        }]
    }
};

/* @api */
const {
    Components,
    Data,
    DOM,
    Hooks,
    Logger,
    Patcher,
    UI,
    Webpack
} = new BdApi(manifest.name);

/* react */
var React = BdApi.React;

/* ../common/Changelog/footer.tsx */
const {
    Text: Text$1
} = Components;

function Footer({
    manifest
}) {
    if (!manifest.invite && !manifest.source) return null;
    let issuesUrl;
    if (manifest.source) {
        const url = new URL(manifest.source);
        const [, owner, repo] = url.pathname.split("/");
        url.pathname = `/${owner}/${repo}/issues`;
        issuesUrl = url.toString();
    }
    return React.createElement(Text$1, null, "Need support?", " ", manifest.invite && React.createElement(React.Fragment, null, "Join the", " ", React.createElement("a", {
        onClick: () => UI.showInviteModal(manifest.invite),
        style: {
            textDecoration: "underline"
        }
    }, "Discord Server"), manifest.source && " or "), manifest.source && React.createElement(React.Fragment, null, "Check for Issues on", " ", React.createElement("a", {
        href: issuesUrl,
        target: "_blank",
        rel: "noreferrer",
        style: {
            textDecoration: "underline"
        }
    }, "GitHub")));
}

/* ../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog) return;
    const {
        date,
        title,
        subtitle,
        ...changelog
    } = manifest.changelog;
    if (!changelog.changes?.length && !changelog.blurb && !changelog.video && !changelog.banner) return;
    const i18n = Webpack.getByKeys("getLocale");
    const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog,
        footer: React.createElement(Footer, {
            manifest
        })
    });
    Data.save("lastVersion", manifest.version);
}

/* @styles */

var Styles = {
    sheets: [],
    _element: null,
    load() {
        DOM.addStyle(this.sheets.join("\n"));
    },
    unload() {
        DOM.removeStyle();
    }
};

/* ../common/ErrorBoundary/style.scss */
Styles.sheets.push("/* ../common/ErrorBoundary/style.scss */", `.errorBoundary {
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
}`);

/* ../common/ErrorBoundary/index.tsx */
const ErrorIcon = (props) => React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "#ddd",
    width: "24",
    height: "24",
    ...props
}, React.createElement("path", {
    d: "M0 0h24v24H0z",
    fill: "none"
}), React.createElement("path", {
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
}));
class ErrorBoundary extends React.Component {
    state = {
        hasError: false,
        error: null,
        info: null
    };
    componentDidCatch(error, info) {
        this.setState({
            error,
            info,
            hasError: true
        });
        console.error(
            `[ErrorBoundary:${this.props.id}] HI OVER HERE!! SHOW THIS SCREENSHOT TO THE DEVELOPER.
`,
            error
        );
    }
    render() {
        if (this.state.hasError) {
            return this.props.mini ? React.createElement(ErrorIcon, {
                fill: "#f04747"
            }) : React.createElement("div", {
                className: "errorBoundary"
            }, React.createElement("div", {
                className: "errorText"
            }, React.createElement("span", null, "An error has occured while rendering ", this.props.id, "."), React.createElement("span", null, "Open console (", React.createElement("code", null, "CTRL + SHIFT + i / CMD + SHIFT + i"), ') - Select the "Console" tab and screenshot the big red error.')));
        } else return this.props.children;
    }
}

/* ../common/Settings/store.ts */
const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", {
    searchExports: true
});
const Flux = Webpack.getByKeys("Store");
const Settings = new class Settings2 extends Flux.Store {
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
}();

/* ../common/Settings/items/dropdown.tsx */
const {
    SettingItem: SettingItem$2
} = Components;
const Select = Webpack.getByStrings('selectionMode:"single",onSelectionChange:', "isSelected:", {
    searchExports: true
});

function DropdownItem(props) {
    return React.createElement(ErrorBoundary, {
        id: props.id
    }, React.createElement(SettingItem$2, {
        ...props
    }, React.createElement(
        Select, {
            closeOnSelect: true,
            options: props.options,
            serialize: (v) => String(v),
            select: (v) => Settings.set(props.id, v),
            isSelected: (v) => Settings.get(props.id, props.value) === v
        }
    )));
}

/* ../common/Settings/items/slider.tsx */
const {
    SettingItem: SettingItem$1
} = Components;
const Slider = Webpack.getByStrings("stickToMarkers");

function SliderItem(props) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(ErrorBoundary, {
        id: props.id
    }, React.createElement(SettingItem$1, {
        ...props
    }, React.createElement(
        Slider, {
            ...props,
            handleSize: 10,
            initialValue: value,
            defaultValue: props.defaultValue,
            minValue: props.minValue,
            maxValue: props.maxValue,
            onValueChange: (value2) => Settings.set(props.id, Math.round(value2)),
            onValueRender: (value2) => Math.round(value2)
        }
    )));
}

/* ../common/Settings/items/switch.tsx */
const {
    SettingItem,
    SwitchInput
} = Components;

function SwitchItem(props) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(ErrorBoundary, {
        id: props.id
    }, React.createElement(SettingItem, {
        ...props,
        inline: true
    }, React.createElement(SwitchInput, {
        value,
        onChange: (v) => Settings.set(props.id, v)
    })));
}

/* ../common/Settings/panel.tsx */
function SettingsPanel({
    items,
    components: customComponents
}) {
    const ComponentMap = {
        dropdown: DropdownItem,
        switch: SwitchItem,
        slider: SliderItem,
        ...customComponents
    };
    return items.map((item) => {
        const Component = ComponentMap[item.type];
        return Component ? React.createElement(Component, {
            key: item.id,
            ...item
        }) : null;
    });
}

/* components/style.scss */
Styles.sheets.push("/* components/style.scss */", `.spectators-panel {
  padding: 8px;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}
.spectators-panel .spectators {
  margin-top: 4px;
  padding-bottom: 4px;
}`);

/* components/spectators.jsx */
const {
    Flex,
    Text,
    Tooltip
} = Components;
const ApplicationStreamingStore = Webpack.getStore("ApplicationStreamingStore");
const AvatarStyles = Webpack.getByKeys("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar");
const Clickable = Webpack.getByStrings("this.context?this.renderNonInteractive():", {
    searchExports: true
});
const RelationshipStore = Webpack.getStore("RelationshipStore");
const UserProfileActions = Webpack.getByKeys("openUserProfileModal", "closeUserProfileModal");
const UserStore = Webpack.getStore("UserStore");
const UserSummaryItem = Webpack.getByStrings("defaultRenderUser", "showDefaultAvatarsForNullUsers");
const LanguageModule = Webpack.getModule((m) => m.intl);
const getLocalizedString = (key, values) => {
    if (!values) return LanguageModule?.intl.formatToPlainString(LanguageModule.t[key]);
    return LanguageModule?.intl.format(LanguageModule.t[key], values);
};
const Strings = {
    SPECTATORS: "BR7Tno",
    NUM_USERS: "3uHFUR"
};
const getDisplayName = (user) => RelationshipStore.getNickname(user.id) || user.globalName || user.username;

function SpectatorsTooltip({
    spectatorIds,
    guildId,
    noTitle
}) {
    if (!spectatorIds && !guildId) {
        const activeStream = Hooks.useStateFromStores(
            [ApplicationStreamingStore],
            () => ApplicationStreamingStore.getCurrentUserActiveStream()
        );
        if (!activeStream) return null;
        spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
        guildId = activeStream.guildId;
    }
    let unknownSpectators = 0;
    const spectators = spectatorIds.map((id) => UserStore.getUser(id)).filter((user) => Boolean(user) || unknownSpectators++);
    return React.createElement(React.Fragment, null, !noTitle && React.createElement(Text, {
        size: Text.Sizes.SIZE_16
    }, getLocalizedString(Strings.SPECTATORS, {
        numViewers: spectatorIds.length
    })), spectators.length > 0 && React.createElement(Flex, {
        direction: Flex.Direction.VERTICAL,
        style: {
            alignItems: "center",
            gap: 6,
            marginTop: "8px"
        }
    }, spectators.map((user) => React.createElement(Flex, {
        style: {
            alignContent: "center",
            gap: 6
        }
    }, React.createElement("img", {
        src: user.getAvatarURL(guildId),
        style: {
            borderRadius: 8,
            height: 16,
            width: 16
        }
    }), getDisplayName(user))), !!unknownSpectators && React.createElement(Flex, {
        style: {
            alignContent: "center"
        }
    }, React.createElement(Text, null, "+", getLocalizedString(Strings.NUM_USERS, {
        num: unknownSpectators
    })))));
}

function SpectatorsPanel() {
    const activeStream = Hooks.useStateFromStores(
        [ApplicationStreamingStore],
        () => ApplicationStreamingStore.getCurrentUserActiveStream()
    );
    if (!activeStream || !Settings.get("showPanel", true)) return null;
    let unknownSpectators = 0;
    const spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
    const spectators = spectatorIds.map((id) => UserStore.getUser(id)).filter((user) => Boolean(user) || unknownSpectators++);
    return React.createElement("div", {
        className: "spectators-panel"
    }, React.createElement(Text, {
        size: Text.Sizes.SIZE_16
    }, getLocalizedString(Strings.SPECTATORS, {
        numViewers: spectatorIds.length
    })), spectatorIds.length ? React.createElement(
        UserSummaryItem, {
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
            renderUser: (user) => React.createElement(Tooltip, {
                text: getDisplayName(user)
            }, (props) => React.createElement(
                Clickable, {
                    ...props,
                    className: AvatarStyles.clickableAvatar,
                    onClick: () => UserProfileActions.openUserProfileModal({
                        userId: user.id,
                        guildId: activeStream.guildId
                    })
                },
                React.createElement(
                    "img", {
                        className: AvatarStyles.avatar,
                        src: user.getAvatarURL(void 0, 80, true),
                        alt: user.username,
                        title: user.username
                    }
                )
            )),
            renderMoreUsers: (label, count) => {
                const sliced = spectators.slice(-count);
                return React.createElement(
                    Tooltip, {
                        text: React.createElement(
                            SpectatorsTooltip, {
                                noTitle: true,
                                guildId: activeStream.guildId,
                                spectatorIds: sliced.map((user) => user.id)
                            }
                        )
                    },
                    (props) => React.createElement("div", {
                        ...props,
                        className: AvatarStyles.moreUsers
                    }, "+", sliced.length)
                );
            }
        }
    ) : null);
}

/* settings.json */
var items = [{
    type: "switch",
    name: "Show Spectators Panel",
    note: "Shows a new panel with the spectators",
    id: "showPanel",
    value: true
}];
var SettingsItems = {
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
                React.createElement(Components.Tooltip, {
                    text: React.createElement(SpectatorsTooltip, null)
                }, (props) => children.map((child) => React.cloneElement(child, props)))
            ];
        });
    }
    patchPanel() {
        const AccountPanelSections = Webpack.getById("688810");
        if (!AccountPanelSections) return Logger.error("Failed to find AccountPanelSections module");
        Patcher.after(AccountPanelSections, "f5", (_, __, res) => {
            if (!res.props.value.every((v) => v === "rtc panel")) return;
            res.props.children.props.children.unshift(React.createElement(SpectatorsPanel, null));
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, {
            items: SettingsItems.items
        });
    }
}

module.exports = ShowSpectators;