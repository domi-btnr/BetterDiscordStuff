/**
 * @name MessagePeek
 * @version 1.1.1
 * @description See the last message in a Channel like on mobile
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/MessagePeek
 * @changelogDate 2025-01-30
 */

'use strict';

/* @manifest */
const manifest = {
    "name": "MessagePeek",
    "version": "1.1.1",
    "description": "See the last message in a Channel like on mobile",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/MessagePeek",
    "changelog": [{
        "title": "Fixed",
        "type": "fixed",
        "items": ["Plugin fixed for the latest Discord update"]
    }],
    "changelogDate": "2025-01-30"
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

/* components/styles.scss */
Styles.sheets.push("/* components/styles.scss */", `a[href^="/channels/@me"] [class^=layout] {
  min-height: 42px;
  max-height: 50px;
  height: unset;
}`);

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

/* modules/shared.js */
const useStateFromStores = Webpack.getByStrings("useStateFromStores", {
    searchExports: true
});

/* components/messagePeek.jsx */
const MessageStore = Webpack.getStore("MessageStore");
const ChannelWrapperStyles = Webpack.getByKeys("muted", "subText");
const ChannelStyles = Webpack.getByKeys("closeButton", "subtext");
const Parser = Webpack.getByKeys("parseTopic");
const i18n = Webpack.getByKeys("getLocale");

function MessagePeek$1({
    channelId,
    timestampOnly
}) {
    if (!channelId) return null;
    const lastMessage = useStateFromStores([MessageStore], () => MessageStore.getMessages(channelId)?.last());
    if (!lastMessage) return null;
    if (!timestampOnly) {
        const attachmentCount = lastMessage.attachments.length;
        const content = lastMessage.content || lastMessage.embeds?.[0]?.rawDescription || lastMessage.stickerItems.length && "Sticker" || attachmentCount && `${attachmentCount} attachment${attachmentCount > 1 ? "s" : ""}`;
        if (!content) return null;
        const charLimit = Settings.get("tooltipCharacterLimit", 256);
        return React.createElement(
            "div", {
                className: ChannelWrapperStyles.subText,
                style: {
                    marginBottom: "2px"
                }
            },
            React.createElement(
                Components.Tooltip, {
                    text: content.length > charLimit ? Parser.parse(content.slice(0, charLimit).trim() + "\u2026") : Parser.parse(content)
                },
                (props) => React.createElement(
                    "div", {
                        ...props,
                        className: ChannelStyles.subtext
                    },
                    Settings.get("showAuthor", true) && `${lastMessage.author["globalName"] || lastMessage.author["username"]}: `,
                    Parser.parseInlineReply(content)
                )
            )
        );
    } else {
        const now = Date.now();
        const dateTimeFormatter = new Intl.DateTimeFormat(i18n.getLocale(), {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        const units = [{
                unit: "s",
                ms: 1e3
            },
            {
                unit: "m",
                ms: 1e3 * 60
            },
            {
                unit: "h",
                ms: 1e3 * 60 * 60
            },
            {
                unit: "d",
                ms: 1e3 * 60 * 60 * 24
            },
            {
                unit: "w",
                ms: 1e3 * 60 * 60 * 24 * 7
            },
            {
                unit: "mo",
                ms: 1e3 * 60 * 60 * 24 * 30
            },
            {
                unit: "y",
                ms: 1e3 * 60 * 60 * 24 * 365
            }
        ];
        const diffInMs = lastMessage.timestamp - now;
        let relativeTime = 0;
        let unit = "";
        for (let i = units.length - 1; i >= 0; i--) {
            const {
                unit: u,
                ms
            } = units[i];
            if (Math.abs(diffInMs) >= ms) {
                relativeTime = Math.floor(diffInMs / ms);
                unit = u;
                break;
            }
        }
        return React.createElement(
            Components.Tooltip, {
                text: dateTimeFormatter.format(lastMessage.timestamp)
            },
            (props) => React.createElement(
                "div", {
                    ...props,
                    style: {
                        marginRight: "5px",
                        color: "var(--channels-default)"
                    }
                },
                `${Math.abs(relativeTime)}${unit}`
            )
        );
    }
}

/* modules/settings.json */
var SettingsItems = [{
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
        markers: [
            0,
            5,
            10,
            20,
            30
        ],
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
        markers: [
            64,
            128,
            256,
            512,
            1024
        ],
        stickToMarkers: true,
        defaultValue: 256
    }
];

/* components/settings.jsx */
const {
    SettingItem,
    SwitchInput
} = Components;
const Select = Webpack.getByStrings('.selectPositionTop]:"top"===', {
    searchExports: true
});
const Slider = Webpack.getByStrings('"markDash".concat(', {
    searchExports: true
});

function DropdownItem(props) {
    return React.createElement(SettingItem, {
        ...props
    }, React.createElement(
        Select, {
            closeOnSelect: true,
            options: props.options,
            serialize: (v) => String(v),
            select: (v) => Settings.set(props.id, v),
            isSelected: (v) => Settings.get(props.id, props.value) === v
        }
    ));
}

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

function SliderItem(props) {
    const value = useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(
        SettingItem, {
            ...props
        },
        React.createElement(
            Slider, {
                ...props,
                initialValue: value,
                defaultValue: props.defaultValue,
                minValue: props.minValue,
                maxValue: props.maxValue,
                handleSize: 10,
                onValueChange: (v) => {
                    Settings.set(props.id, Math.round(v));
                },
                onValueRender: (v) => Math.round(v)
            }
        )
    );
}

function renderSettings(items) {
    return items.map((item) => {
        switch (item.type) {
            case "dropdown":
                return React.createElement(DropdownItem, {
                    ...item
                });
            case "switch":
                return React.createElement(SwitchItem, {
                    ...item
                });
            case "slider":
                return React.createElement(SliderItem, {
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

/* index.jsx */
class MessagePeek {
    start() {
        if (Settings.get("preloadLimit", 10) > 30)
            Settings.set("preloadLimit", 10);
        showChangelog(manifest);
        this.patchDMs();
        this.patchGuildChannel();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    patchDMs() {
        const ChannelContext = React.createContext(null);
        const [ChannelWrapper, Key_CW] = Webpack.getWithKey(Webpack.Filters.byStrings("isGDMFacepileEnabled"));
        const [ChannelItem, Key_CI] = Webpack.getWithKey(Webpack.Filters.byStrings("as:", ".interactive,"));
        const [NameWrapper, Key_NW] = Webpack.getWithKey((x) => x.toString().includes(".nameAndDecorators") && !x.toString().includes("FocusRing"));
        const ChannelClasses = Webpack.getByKeys("channel", "decorator");
        Patcher.after(ChannelWrapper, Key_CW, (_, __, res) => {
            if (!Settings.get("showInDMs", true)) return;
            Patcher.after(res, "type", (_2, [props], res2) => {
                return React.createElement(ChannelContext.Provider, {
                    value: props.channel
                }, res2);
            });
        });
        Patcher.after(ChannelItem, Key_CI, (_, __, res) => {
            if (!Settings.get("showTimestamp", true)) return;
            const channel = React.useContext(ChannelContext);
            if (!channel) return res;
            const children = res.props.children;
            children.splice(children.length - 1, 0, React.createElement(MessagePeek$1, {
                channelId: channel.id,
                timestampOnly: true
            }));
        });
        Patcher.after(NameWrapper, Key_NW, (_, __, res) => {
            const channel = React.useContext(ChannelContext);
            if (!channel) return res;
            const nameWrapper = Utils.findInTree(res, (e) => e?.props?.className?.startsWith("content_"), {
                walkable: ["children", "props"]
            });
            if (!nameWrapper) return res;
            nameWrapper.props.children.push(
                React.createElement(MessagePeek$1, {
                    channelId: channel.id
                })
            );
        });
        const preload = Webpack.getByKeys("preload")?.preload;
        Webpack.getStore("ChannelStore").getSortedPrivateChannels().filter(
            (channel) => channel.lastMessageId && !Webpack.getStore("MessageStore").getMessages(channel.id)?.last()
        ).slice(0, Settings.get("preloadLimit", 10)).reduce((promise, channel, index) => {
            return promise.then(() => {
                preload("@me", channel.id);
                return new Promise((resolve) => setTimeout(resolve, 125 + index * 125));
            });
        }, Promise.resolve());
        const ChannelWrapperElement = document.querySelector(`h2 + .${ChannelClasses.channel}`);
        if (ChannelWrapperElement) {
            const ChannelWrapperInstance = ReactUtils.getOwnerInstance(ChannelWrapperElement);
            if (ChannelWrapperInstance) ChannelWrapperInstance.forceUpdate();
        }
    }
    patchGuildChannel() {
        const [ChannelWrapper, Key_CW] = Webpack.getWithKey(Webpack.Filters.byStrings("channel", "unread", ".ALL_MESSAGES"));
        Patcher.after(ChannelWrapper, Key_CW, (_, [{
            channel
        }], res) => {
            if (!Settings.get("showInGuilds", true)) return;
            const nameWrapper = Utils.findInTree(res, (e) => e?.props?.className?.startsWith("name_"), {
                walkable: ["children", "props"]
            });
            if (!nameWrapper) return res;
            nameWrapper.props.children = [
                nameWrapper.props.children,
                React.createElement(MessagePeek$1, {
                    channelId: channel.id
                })
            ];
            if (!Settings.get("showTimestamp", true)) return;
            const innerWrapper = Utils.findInTree(res, (e) => e?.props?.className?.startsWith("linkTop_"), {
                walkable: ["children", "props"]
            });
            if (!innerWrapper) return res;
            const children = innerWrapper.props.children;
            children.splice(children.length - 1, 0, React.createElement(MessagePeek$1, {
                channelId: channel.id,
                timestampOnly: true
            }));
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, null);
    }
}

module.exports = MessagePeek;