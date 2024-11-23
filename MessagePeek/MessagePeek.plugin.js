/**
 * @name MessagePeek
 * @version 0.0.1
 * @description See the last message in a Channel like on mobile
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/MessagePeek
 * @changelogDate 2024-11-23
 */

'use strict';

/* @module react */
const React = BdApi.React;
/*@end */

/* @module @manifest */
var manifest = {
    "name": "MessagePeek",
    "version": "0.0.1",
    "description": "See the last message in a Channel like on mobile",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/MessagePeek",
    "changelog": [],
    "changelogDate": "2024-11-23"
};
/*@end */

/* @module @api */
const {
    Components,
    ContextMenu,
    Data,
    DOM,
    Net,
    Patcher,
    Plugins,
    ReactUtils,
    Themes,
    UI,
    Utils,
    Webpack
} = new BdApi(manifest.name);
/*@end */

/* @module @styles */

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
/*@end */

/* @module shared.js */
const useStateFromStores = Webpack.getByStrings("useStateFromStores", {
    searchExports: true
});

/*@end */

/* @module settings.js */
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

/*@end */

/* @module styles.scss */
Styles.sheets.push("/* styles.scss */", `a[href^="/channels/@me"] [class^=layout] {
  min-height: 42px;
  max-height: 50px;
  height: unset;
}`); /*@end */

/* @module messagePeek.jsx */
const MessageStore = Webpack.getStore("MessageStore");
const ChannelWrapperStyles = Webpack.getByKeys("muted", "subText");
const ChannelStyles = Webpack.getByKeys("closeButton", "subtext");
const Parser = Webpack.getByKeys("parseTopic");

function MessagePeek$1({
    channelId
}) {
    if (!channelId) return null;
    const lastMessage = useStateFromStores([MessageStore], () => MessageStore.getMessages(channelId)?.last());
    if (!lastMessage) return null;
    const attachmentCount = lastMessage.attachments.length;
    const content = lastMessage.content || lastMessage.embeds?.[0]?.rawDescription || lastMessage.stickerItems.length && "Sticker" || attachmentCount && `${attachmentCount} attachment${attachmentCount > 1 ? "s" : ""}`;
    if (!content) return null;
    return React.createElement(
        "div", {
            className: ChannelWrapperStyles.subText,
            style: {
                marginBottom: "2px"
            }
        },
        React.createElement(Components.Tooltip, {
            text: content.length > 256 ? Parser.parse(content.slice(0, 256).trim()) : Parser.parse(content)
        }, (props) => React.createElement(
            "div", {
                ...props,
                className: ChannelStyles.subtext
            },
            Settings.get("showAuthor", true) && `${lastMessage.author["globalName"] || lastMessage.author["username"]}: `,
            Parser.parseInlineReply(content)
        ))
    );
}

/*@end */

/* @module settings.json */
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
    }
];
/*@end */

/* @module settings.jsx */
const {
    FormDivider,
    FormSwitch,
    FormText,
    FormTitle,
    Select
} = Webpack.getByKeys("Select");

function Dropdown(props) {
    return React.createElement("div", {
        style: {
            marginBottom: "20px"
        }
    }, React.createElement(
        FormTitle, {
            tag: "h3",
            style: {
                margin: "0px",
                color: "var(--header-primary)"
            }
        },
        props.name
    ), props.note && React.createElement(
        FormText, {
            type: FormText.Types.DESCRIPTION,
            style: {
                marginBottom: "5px"
            }
        },
        props.note
    ), React.createElement(
        Select, {
            closeOnSelect: true,
            options: props.options,
            serialize: (v) => String(v),
            select: (v) => Settings.set(props.id, v),
            isSelected: (v) => Settings.get(props.id, props.value) === v
        }
    ), React.createElement(FormDivider, {
        style: {
            marginTop: "20px"
        }
    }));
}

function Switch(props) {
    const value = useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(
        FormSwitch, {
            ...props,
            value,
            children: props.name,
            onChange: (v) => {
                Settings.set(props.id, v);
            }
        }
    );
}

function renderSettings(items) {
    return items.map((item) => {
        switch (item.type) {
            case "dropdown":
                return React.createElement(Dropdown, {
                    ...item
                });
            case "switch":
                return React.createElement(Switch, {
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

/*@end */

/* @module changelog.scss */
Styles.sheets.push("/* changelog.scss */", `.Changelog-Title-Wrapper {
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
}`); /*@end */

/* @module index.jsx */
const preload = Webpack.getByKeys("preload").preload;
class MessagePeek {
    start() {
        this.showChangelog();
        this.patchDMs();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    showChangelog() {
        if (!manifest.changelog.length || Settings.get("lastVersion") === manifest.version) return;
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
        Settings.set("lastVersion", manifest.version);
        UI.alert(title, items);
    }
    patchDMs() {
        const ChannelContext = React.createContext(null);
        const [ChannelWrapper, Key_CW] = Webpack.getWithKey(Webpack.Filters.byStrings("isGDMFacepileEnabled"));
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
        Patcher.after(NameWrapper, Key_NW, (_, __, res) => {
            const channel = React.useContext(ChannelContext);
            if (!channel) return res;
            res.props.children[1].props.children.push(
                React.createElement(MessagePeek$1, {
                    channelId: channel.id
                })
            );
        });
        Webpack.getStore("ChannelStore").getSortedPrivateChannels().forEach((channel) => preload("@me", channel.id));
        const ChannelWrapperElement = document.querySelector(`h2 + .${ChannelClasses.channel}`);
        if (ChannelWrapperElement) {
            const ChannelWrapperInstance = ReactUtils.getOwnerInstance(ChannelWrapperElement);
            if (ChannelWrapperInstance) ChannelWrapperInstance.forceUpdate();
        }
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, null);
    }
}

/*@end */

module.exports = MessagePeek;