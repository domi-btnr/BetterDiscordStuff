/**
 * @name UnsuppressEmbeds
 * @version 1.0.0
 * @description Allows you to unsuppress embeds in messages
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/UnsuppressEmbeds
 * @changelogDate 
 */

'use strict';

/* @manifest */
const manifest = {
    "name": "UnsuppressEmbeds",
    "version": "1.0.0",
    "description": "Allows you to unsuppress embeds in messages",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/UnsuppressEmbeds",
    "changelog": [],
    "changelogDate": ""
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

/* components/icons.tsx */
function ImageVisible(props) {
    return React.createElement(
        "svg", {
            ...props,
            className: Utils.className(props.className, "image-visible"),
            viewBox: "0 0 24 24"
        },
        React.createElement("path", {
            fill: "currentColor",
            d: "M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm1-2h12l-3.75-5-3 4L9 13Zm-1 2V5v14Z"
        })
    );
}

function ImageInvisible(props) {
    return React.createElement(
        "svg", {
            ...props,
            className: Utils.className(props.className, "image-invisible"),
            viewBox: "0 0 24 24"
        },
        React.createElement("path", {
            fill: "currentColor",
            d: "m21 18.15-2-2V5H7.85l-2-2H19q.825 0 1.413.587Q21 4.175 21 5Zm-1.2 4.45L18.2 21H5q-.825 0-1.413-.587Q3 19.825 3 19V5.8L1.4 4.2l1.4-1.4 18.4 18.4ZM6 17l3-4 2.25 3 .825-1.1L5 7.825V19h11.175l-2-2Zm7.425-6.425ZM10.6 13.4Z"
        })
    );
}

/* modules/utils.ts */
function findGroupById(res, id) {
    if (!res) return null;
    let children = res?.props?.children;
    if (!children) return null;
    if (!Array.isArray(children))
        children = [children];
    if (children.some(
            (child) => child && typeof child === "object" && "props" in child && child.props.id === id
        )) return res;
    for (const child of children)
        if (child && typeof child === "object") {
            const found = findGroupById(child, id);
            if (found) return found;
        }
}

/* index.tsx */
let unpatchContextMenu;
const EMBED_SUPPRESSED = 1 << 2;
class UnsuppressEmbeds {
    start() {
        showChangelog(manifest);
        this.patchMessageContextMenu();
        Styles.load();
    }
    stop() {
        unpatchContextMenu?.();
        Styles.unload();
    }
    patchMessageContextMenu() {
        const Endpoints = Webpack.getModule((m) => typeof m?.MESSAGES === "function", {
            searchExports: true
        });
        const PermissionsBits = Webpack.getModule((m) => m?.EMBED_LINKS, {
            searchExports: true
        });
        const PermissionStore = Webpack.getStore("PermissionStore");
        const RestAPI = Webpack.getModule((m) => typeof m === "object" && m.del && m.put, {
            searchExports: true
        });
        const UserStore = Webpack.getStore("UserStore");
        unpatchContextMenu = ContextMenu.patch("message", (res, {
            channel,
            message: {
                author,
                messageSnapshots,
                embeds,
                flags,
                id: messageId
            }
        }) => {
            const isEmbedSuppressed = (flags & EMBED_SUPPRESSED) !== 0;
            const hasEmbedsInSnapshots = messageSnapshots.some(
                (snapshot) => snapshot?.message.embeds.length
            );
            if (!isEmbedSuppressed && !embeds.length && !hasEmbedsInSnapshots) return;
            const hasEmbedPerms = channel.isPrivate() || !!(PermissionStore.getChannelPermissions({
                id: channel.id
            }) & PermissionsBits.EMBED_LINKS);
            if (author.id === UserStore.getCurrentUser().id && !hasEmbedPerms) return;
            const menuGroup = findGroupById(res, "delete")?.props?.children;
            const deleteIndex = menuGroup?.findIndex((i) => i?.props?.id === "delete");
            if (!menuGroup || !deleteIndex) return;
            menuGroup.splice(
                deleteIndex - 1,
                0,
                // @ts-ignore
                React.createElement(
                    ContextMenu.Item, {
                        id: "unsuppress-embeds",
                        key: "unsuppress-embeds",
                        label: isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds",
                        color: isEmbedSuppressed ? void 0 : "danger",
                        icon: isEmbedSuppressed ? ImageVisible : ImageInvisible,
                        action: () => RestAPI.patch({
                            url: Endpoints.MESSAGE(channel.id, messageId),
                            body: {
                                flags: isEmbedSuppressed ? flags & -5 : flags | EMBED_SUPPRESSED
                            }
                        })
                    }
                )
            );
        });
    }
}

module.exports = UnsuppressEmbeds;