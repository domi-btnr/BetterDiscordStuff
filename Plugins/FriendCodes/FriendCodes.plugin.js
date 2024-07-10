/**
 * @name FriendCodes
 * @version 1.0.2
 * @description Generate FriendCodes to easily add friends
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/FriendCodes
 * @changelogDate 2024-07-10
 */

'use strict';

/* @module react */
const React = BdApi.React;
/*@end */

/* @module @manifest */
var manifest = {
    "name": "FriendCodes",
    "version": "1.0.2",
    "description": "Generate FriendCodes to easily add friends",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/FriendCodes",
    "changelog": [{
        "title": "Fixed",
        "type": "fixed",
        "items": ["Only show the Friend Codes Tab in the Friendlist"]
    }],
    "changelogDate": "2024-07-10"
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

/* @module style.scss */
Styles.sheets.push("/* style.scss */", `.item {
  color: #fff;
  display: flex;
  position: relative;
  flex-direction: column;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background: var(--background-secondary);
}
.item code {
  background: var(--background-tertiary);
  padding: 2px;
}
.item div {
  margin: 2px;
}

.buttonContainer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.buttonContainer .buttonContainerInner {
  display: block;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;
}
.buttonContainer .buttonContainerInner button {
  width: 80px;
}

.noInvites img {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.noInvites h2 {
  margin-top: 25px;
  text-align: center;
  font-weight: 500;
  font-size: large;
}`);
var styles = {
    "item": "item",
    "buttonContainer": "buttonContainer",
    "buttonContainerInner": "buttonContainerInner",
    "noInvites": "noInvites"
};
/*@end */

/* @module modal.jsx */
const {
    DiscordNative: {
        clipboard: {
            copy
        }
    }
} = Webpack.getByKeys("DiscordNative");
const {
    Button,
    Heading,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalRoot,
    ModalSize
} = Webpack.getByKeys("ModalContent");
const {
    createFriendInvite,
    getAllFriendInvites,
    revokeFriendInvites
} = Webpack.getByKeys("createFriendInvite");
const Flex = Webpack.getByStrings(".HORIZONTAL", ".START");
const Markdown = Webpack.getByKeys("parseTopic");

function CopyButton({
    copyText,
    copiedText,
    onClick
}) {
    const [copied, setCopied] = React.useState(false);
    const handleButtonClick = (e) => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1e3);
        onClick(e);
    };
    return React.createElement(
        Button, {
            onClick: handleButtonClick,
            color: copied ? Button.Colors.GREEN : Button.Colors.BRAND,
            size: Button.Sizes.SMALL,
            look: Button.Looks.FILLED
        },
        copied ? copiedText : copyText
    );
}

function InviteCard(props) {
    return React.createElement("div", {
        className: styles.item
    }, React.createElement("div", {
        className: styles.code
    }, React.createElement("span", null, React.createElement("b", null, "Code:"), " ", Markdown.parse(`\`${props.invite.code}\``))), React.createElement("div", {
        className: styles.uses
    }, React.createElement("span", null, React.createElement("b", null, "Uses:"), " ", props.invite.uses, "/", props.invite.max_uses)), React.createElement("div", {
        className: styles.expiresAt
    }, React.createElement("span", null, React.createElement("b", null, "Expires in:"), " ", Markdown.parse(`<t:${Math.floor(Date.parse(props.invite.expires_at).toString().slice(0, -3))}:R>`))), React.createElement("div", {
        className: styles.buttonContainer
    }, React.createElement("div", {
        className: styles.buttonContainerInner
    }, React.createElement(
        CopyButton, {
            copiedText: "Copied!",
            copyText: "Copy",
            onClick: () => copy(`https://discord.gg/${props.invite.code}`)
        }
    ))));
}

function Modal(props) {
    const [invites, setInvites] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
        setLoading(true);
        getAllFriendInvites().then((invites2) => setInvites(invites2)).then(() => setLoading(false));
    }, []);
    return React.createElement(ModalRoot, {
        ...props,
        size: ModalSize.MEDIUM
    }, React.createElement(ModalHeader, {
        separator: false
    }, React.createElement(Heading, {
        level: "2",
        variant: "heading-lg/medium"
    }, "Friend Codes")), React.createElement(ModalContent, null, loading ? React.createElement("div", {
        className: styles.loading
    }) : invites.length > 0 ? invites.map((invite) => React.createElement(InviteCard, {
        key: invite.code,
        invite
    })) : React.createElement("div", {
        className: styles.noInvites
    }, React.createElement("img", {
        src: "https://discord.com/assets/b36c705f790dad253981f1893085015a.svg",
        draggable: false
    }), React.createElement(Heading, {
        level: "3",
        variant: "heading-lg/small"
    }, "You don't have any friend codes yet"))), React.createElement(ModalFooter, null, React.createElement(Flex, {
        justify: Flex.Justify.BETWEEN
    }, React.createElement(Flex, {
        justify: Flex.Justify.START
    }, React.createElement(Button, {
        color: Button.Colors.GREEN,
        look: Button.Looks.OUTLINED,
        onClick: () => createFriendInvite().then((invite) => setInvites([...invites, invite]))
    }, "Create Friend Code"), React.createElement(Flex, {
        justify: Flex.Justify.START
    }, React.createElement(Button, {
        color: Button.Colors.RED,
        look: Button.Looks.LINK,
        disabled: !invites.length,
        onClick: () => revokeFriendInvites().then(setInvites([]))
    }, "Revoke all Friend Codes"))), React.createElement(Button, {
        onClick: props.onClose
    }, "Okay"))));
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
const Settings = Data.load("SETTINGS") || {};
class FriendCodes {
    start() {
        this.showChangelog();
        this.patchFriendsTabBar();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    showChangelog() {
        if (Settings.lastVersion === manifest.version) return;
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
        }, item.type), item.items.map((item2) => React.createElement("span", null, item2))));
        "changelogImage" in manifest && items.unshift(
            React.createElement("img", {
                className: "Changelog-Banner",
                src: manifest.changelogImage
            })
        );
        Settings.lastVersion = manifest.version;
        Data.save("SETTINGS", Settings);
        UI.alert(title, items);
    }
    patchFriendsTabBar() {
        const TabBar = Webpack.getModule((x) => x.Item && x.Header, {
            searchExports: true
        });
        const availableTabs = Webpack.getByKeys("ALL", "BLOCKED", "ONLINE", {
            searchExports: true
        });
        const {
            openModal
        } = Webpack.getModule((x) => x.openModal);
        Patcher.after(TabBar.prototype, "render", (_, __, ret) => {
            if (!(ret._owner.memoizedProps?.selectedItem in availableTabs)) return;
            ret.props.children.push(
                React.createElement(
                    TabBar.Item, {
                        selectedItem: 0,
                        onClick: () => openModal((props) => React.createElement(Modal, {
                            ...props
                        }))
                    },
                    "Friend Codes"
                )
            );
        });
    }
}

/*@end */

module.exports = FriendCodes;