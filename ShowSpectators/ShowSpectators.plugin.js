/**
 * @name ShowSpectators
 * @version 1.0.3
 * @description Shows you who's spectating your stream under the screenshare panel
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ShowSpectators
 * @changelogDate 2025-09-17
 */

'use strict';

/* @manifest */
const manifest = {
    "name": "ShowSpectators",
    "version": "1.0.3",
    "description": "Shows you who's spectating your stream under the screenshare panel",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ShowSpectators",
    "changelog": [{
        "title": "It works again!",
        "type": "fixed",
        "items": [
            "The Panel shows up again",
            "Localisation works again"
        ]
    }],
    "changelogDate": "2025-09-17"
};

/* @api */
const {
    Commands,
    Components,
    ContextMenu,
    Data,
    DOM,
    Logger,
    Net,
    Patcher,
    Plugins,
    ReactUtils,
    Themes,
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

/* react */
var React = BdApi.React;

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
}
.Changelog-Item .Changelog-Header {
  display: flex;
  text-transform: uppercase;
  font-weight: 700;
  align-items: center;
  margin-bottom: 10px;
}
.Changelog-Item .Changelog-Header.added {
  color: #45BA6A;
}
.Changelog-Item .Changelog-Header.changed {
  color: #F0B232;
}
.Changelog-Item .Changelog-Header.fixed {
  color: #EC4245;
}
.Changelog-Item .Changelog-Header.improved {
  color: #5865F2;
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
    "changelogImage" in manifest && items.unshift(
        React.createElement("img", {
            className: "Changelog-Banner",
            src: manifest.changelogImage
        })
    );
    UI.alert(title, items);
    Data.save("lastVersion", manifest.version);
}

/* modules/settings.js */
const Dispatcher = Webpack.getByKeys("dispatch", "subscribe");
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

/* modules/settings.json */
var SettingsItems = [{
    type: "switch",
    name: "Show Spectators Panel",
    note: "Shows a new panel with the spectators",
    id: "showPanel",
    value: true
}];

/* modules/shared.js */
const useStateFromStores = Webpack.getByStrings("useStateFromStores", {
    searchExports: true
});

/* components/settings.jsx */
const {
    SettingItem,
    SwitchInput
} = Components;

function SwitchItem(props) {
    const value = useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(
        SettingItem, {
            ...props,
            inline: true
        },
        React.createElement(
            SwitchInput, {
                value,
                onChange: (v) => {
                    Settings.set(props.id, v);
                }
            }
        )
    );
}

function renderSettings(items) {
    return items.map((item) => {
        switch (item.type) {
            case "switch":
                return React.createElement(SwitchItem, {
                    ...item
                });
            default:
                return null;
        }
    });
}

function SettingsPanel() {
    return React.createElement("div", {
        className: "settings-panel"
    }, renderSettings(SettingsItems));
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
    SPECTATORS: "BR7Tnp",
    NUM_USERS: "3uHFUV"
};
const getDisplayName = (user) => RelationshipStore.getNickname(user.id) || user.globalName || user.username;

function SpectatorsTooltip({
    spectatorIds,
    guildId,
    noTitle
}) {
    if (!spectatorIds && !guildId) {
        const activeStream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getCurrentUserActiveStream());
        if (!activeStream) return null;
        spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
        guildId = activeStream.guildId;
    }
    let unknownSpectators = 0;
    const spectators = spectatorIds.map((id) => UserStore.getUser(id)).filter((user) => Boolean(user) || unknownSpectators++);
    return spectatorIds.length ? React.createElement(React.Fragment, null, !noTitle && React.createElement(Text, {
        size: Text.Sizes.SIZE_16,
        style: {
            marginBottom: "8px"
        }
    }, getLocalizedString(Strings.SPECTATORS, {
        numViewers: spectatorIds.length
    })), React.createElement(
        Flex, {
            direction: Flex.Direction.VERTICAL,
            style: {
                alignItems: "center",
                gap: 6
            }
        },
        spectators.map((user) => React.createElement(Flex, {
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
        }), getDisplayName(user))),
        !!unknownSpectators && React.createElement(Flex, {
            style: {
                alignContent: "center"
            }
        }, React.createElement(Text, null, "+", getLocalizedString(Strings.NUM_USERS, {
            num: unknownSpectators
        })))
    )) : "No spectators";
}

function SpectatorsPanel() {
    const activeStream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getCurrentUserActiveStream());
    if (!activeStream || !Settings.get("showPanel", true)) return null;
    let unknownSpectators = 0;
    const spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
    const spectators = spectatorIds.map((id) => UserStore.getUser(id)).filter((user) => Boolean(user) || unknownSpectators++);
    return React.createElement("div", {
        className: "spectators-panel"
    }, React.createElement(Text, {
        size: Text.Sizes.SIZE_16
    }, spectatorIds.length ? getLocalizedString(Strings.SPECTATORS, {
        numViewers: spectatorIds.length
    }) : "No spectators"), spectatorIds.length ? React.createElement(
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
                return React.createElement(Tooltip, {
                    text: React.createElement(
                        SpectatorsTooltip, {
                            noTitle: true,
                            guildId: activeStream.guildId,
                            spectatorIds: sliced.map((user) => user.id)
                        }
                    )
                }, (props) => React.createElement("div", {
                    ...props,
                    className: AvatarStyles.moreUsers
                }, "+", sliced.length));
            }
        }
    ) : null);
}

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
        Patcher.after(StreamIcon, "Z", (_, __, res) => {
            const children = res.props.children;
            res.props.children = [
                React.createElement(
                    Components.Tooltip, {
                        text: React.createElement(SpectatorsTooltip, null)
                    },
                    (props) => children.map((child) => React.cloneElement(child, props))
                )
            ];
        });
    }
    patchPanel() {
        const StreamPanel = Webpack.getModule((_, __, id) => id == 906732);
        const unpatch = Patcher.after(StreamPanel, "Gt", (_, __, res) => {
            if (!res.props.value.every((v) => v === "rtc panel")) return;
            const voiceSection = Utils.findInTree(res, (e) => e?.props?.canGoLive, {
                walkable: ["children", "props"]
            });
            if (!voiceSection) return;
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
        return React.createElement(SettingsPanel, null);
    }
}

module.exports = ShowSpectators;