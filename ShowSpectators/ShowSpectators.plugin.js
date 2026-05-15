/**
 * @name ShowSpectators
 * @version 1.0.5
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
    "version": "1.0.5",
    "description": "Shows you who's spectating your stream under the screenshare panel",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ShowSpectators",
    "changelog": [{
        "title": "Better logging for Errors!",
        "type": "improved",
        "items": [
            "It should now be easier to find out why the plugin isn't working for you, as it will log the error to the console"
        ]
    }],
    "changelogDate": "2026-05-15"
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
    Utils,
    Webpack
} = new BdApi(manifest.name);

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

/* ../common/Changelog/style.scss */
Styles.sheets.push("/* ../common/Changelog/style.scss */", `.Changelog-Title-Wrapper {
  font-size: 20px;
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--header-primary);
  line-height: 1.2;
}
.Changelog-Title-Wrapper div {
  font-size: 12px;
  font-weight: 400;
  font-family: var(--font-primary);
  color: var(--primary-300);
  line-height: 1.3333333333;
}

.Changelog-Banner {
  width: 405px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.Changelog-Item {
  color: #c4c9ce;
  margin-bottom: 16px;
}
.Changelog-Item .Changelog-Header {
  display: flex;
  text-transform: uppercase;
  font-weight: 700;
  align-items: center;
  margin-bottom: 10px;
}
.Changelog-Item .Changelog-Header.added {
  color: #45ba6a;
}
.Changelog-Item .Changelog-Header.changed {
  color: #f0b232;
}
.Changelog-Item .Changelog-Header.fixed {
  color: #ec4245;
}
.Changelog-Item .Changelog-Header.improved {
  color: #5865f2;
}
.Changelog-Item .Changelog-Header::after {
  content: "";
  flex-grow: 1;
  height: 1px;
  margin-left: 7px;
  background: currentColor;
}
.Changelog-Item span {
  display: list-item;
  list-style: inside;
  margin-left: 5px;
}
.Changelog-Item span::marker {
  color: var(--background-accent);
}`);

/* react */
var React = BdApi.React;

/* ../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog.length) return;
    const i18n = Webpack.getByKeys("getLocale");
    const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    const title = React.createElement("div", {
        className: "Changelog-Title-Wrapper"
    }, React.createElement("h1", null, "What's New - ", manifest.name), React.createElement("div", null, formatter.format(new Date(manifest.changelogDate)), " - v", manifest.version));
    const items = manifest.changelog.map((item) => React.createElement("div", {
        className: "Changelog-Item"
    }, React.createElement("h4", {
        className: `Changelog-Header ${item.type}`
    }, item.title), item.items.map((item2) => React.createElement("span", null, item2))));
    "changelogImage" in manifest && items.unshift(React.createElement("img", {
        className: "Changelog-Banner",
        src: manifest.changelogImage
    }));
    UI.alert(title, items);
    Data.save("lastVersion", manifest.version);
}

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
    get(key, def = null) {
        return this._settings[key] ?? def;
    }
    set(key, value) {
        this._settings[key] = value;
        Data.save("SETTINGS", this._settings);
        this.emitChange();
    }
}();

/* ../common/Settings/panel.tsx */
const {
    SettingItem,
    SwitchInput
} = Components;
const Select = Webpack.getByStrings('selectionMode:"single",onSelectionChange:', "isSelected:", {
    searchExports: true
});
const Slider = Webpack.getByStrings("stickToMarkers");

function DropdownItem(props) {
    return React.createElement(ErrorBoundary, {
        key: props.id,
        id: props.id
    }, React.createElement(SettingItem, {
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

function SwitchItem(props) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(ErrorBoundary, {
        key: props.id,
        id: props.id
    }, React.createElement(SettingItem, {
        ...props,
        inline: true
    }, React.createElement(SwitchInput, {
        value,
        onChange: (v) => Settings.set(props.id, v)
    })));
}

function SliderItem(props) {
    if (!Slider) return null;
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(ErrorBoundary, {
        key: props.id,
        id: props.id
    }, React.createElement(SettingItem, {
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

function SettingsPanel(props) {
    const ComponentMap = {
        dropdown: DropdownItem,
        switch: SwitchItem,
        slider: SliderItem
    };
    return props.items.map((item) => {
        const Component = ComponentMap[item.type];
        return Component ? React.createElement(Component, {
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
        const unpatch = Patcher.after(AccountPanelSections, "f5", (_, __, res) => {
            if (!res.props.value.every((v) => v === "rtc panel")) return;
            const voiceSection = Utils.findInTree(res, (e) => e?.props?.canGoLive, {
                walkable: ["children", "props"]
            });
            if (!voiceSection) return Logger.error("Failed to find voice section in AccountPanelSections");
            unpatch();
            Patcher.after(voiceSection.type.prototype, "render", (_2, __2, res2) => {
                if (!res2) return;
                const original = res2.props.children();
                res2.props.children = () => {
                    return React.createElement(React.Fragment, null, React.createElement(SpectatorsPanel, null), original);
                };
            });
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, {
            items: SettingsItems.items
        });
    }
}

module.exports = ShowSpectators;