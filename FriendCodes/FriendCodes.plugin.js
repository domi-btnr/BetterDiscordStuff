/**
 * @name FriendCodes
 * @version 1.1.1
 * @description Generate FriendCodes to easily add friends
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/FriendCodes
 * @changelogDate 2024-11-02
 */

'use strict';

/* @module react */
const React = BdApi.React;
/*@end */

/* @module @manifest */
var manifest = {
    "name": "FriendCodes",
    "version": "1.1.1",
    "description": "Generate FriendCodes to easily add friends",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/FriendCodes",
    "changelog": [{
        "title": "New Spot for FriendCodes",
        "type": "improved",
        "items": ["Moved the FriendCodes Section to the \"Add Friends\" Panel"]
    }],
    "changelogDate": "2024-11-02"
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

/* @module errorBoundary.scss */
Styles.sheets.push("/* errorBoundary.scss */", `.errorBoundary {
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
}`); /*@end */

/* @module errorBoundary.jsx */
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
        console.error(`[ErrorBoundary:${this.props.id}] HI OVER HERE!! SHOW THIS SCREENSHOT TO THE DEVELOPER.
`, error);
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

/*@end */

/* @module style.scss */
Styles.sheets.push("/* style.scss */", `.card {
  padding: 20px;
  margin-bottom: var(--custom-margin-margin-small);
  border-width: 1px;
  border-style: solid;
  border-radius: 5px;
  border-color: var(--background-tertiary);
  background-color: var(--background-secondary);
}

.cardTitle span {
  color: var(--header-secondary);
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 400;
}

.panelHeader {
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--header-secondary);
  text-transform: uppercase;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.02em;
  font-family: var(--font-display);
  font-weight: 600;
}

.panelText {
  display: flex;
  justify-content: center;
  align-items: center;
}`);
var styles = {
    "card": "card",
    "cardTitle": "cardTitle",
    "panelHeader": "panelHeader",
    "panelText": "panelText"
};
/*@end */

/* @module shared.js */
const DiscordCompononents = Webpack.getByKeys("Button", "FormTitle");
const Flex = Webpack.getByStrings(".HORIZONTAL", ".START");

/*@end */

/* @module copyButton.jsx */
const {
    Button: Button$1
} = DiscordCompononents;

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
        Button$1, {
            onClick: handleButtonClick,
            color: copied ? Button$1.Colors.GREEN : Button$1.Colors.BRAND,
            size: Button$1.Sizes.SMALL,
            look: Button$1.Looks.FILLED
        },
        copied ? copiedText : copyText
    );
}

/*@end */

/* @module codeCard.jsx */
const {
    FormTitle: FormTitle$1
} = DiscordCompononents;
const Parser = Webpack.getByKeys("parseTopic");
const {
    DiscordNative: {
        clipboard
    }
} = Webpack.getByKeys("DiscordNative");

function FriendCodeCard({
    invite
}) {
    return React.createElement("div", {
        className: styles.card
    }, React.createElement(Flex, {
        justify: Flex.Justify.START
    }, React.createElement("div", {
        className: styles.cardTitle
    }, React.createElement(FormTitle$1, {
        tag: "h4",
        style: {
            textTransform: "none"
        }
    }, invite.code), React.createElement("span", null, "Expires ", Parser.parse(`<t:${new Date(invite.expires_at).getTime() / 1e3}:R>`), " \u2022 ", invite.uses, "/", invite.max_uses, " uses")), React.createElement(Flex, {
        justify: Flex.Justify.END
    }, React.createElement(
        CopyButton, {
            copyText: "Copy",
            copiedText: "Copied!",
            onClick: () => clipboard.copy(`https://discord.gg/${invite.code}`)
        }
    ))));
}

/*@end */

/* @module panel.jsx */
const {
    Button,
    FormTitle,
    Text
} = DiscordCompononents;
const FormStyles = Webpack.getAllByKeys("header", "title", "emptyState")?.filter((m) => !m.timestamp)?.[0];
const {
    createFriendInvite,
    getAllFriendInvites,
    revokeFriendInvites
} = Webpack.getByKeys("createFriendInvite");

function FriendCodesPanel() {
    const [invites, setInvites] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
        setLoading(true);
        getAllFriendInvites().then(setInvites).then(() => setLoading(false));
    }, []);
    return React.createElement("header", {
        className: FormStyles.header
    }, React.createElement(
        FormTitle, {
            tag: "h2",
            className: FormStyles.title
        },
        "Your Friend Codes"
    ), React.createElement(
        Flex, {
            style: {
                marginBottom: "16px"
            },
            justify: Flex.Justify.BETWEEN
        },
        React.createElement("h2", {
            className: styles.panelHeader
        }, `Friend Codes - ${invites.length}`),
        React.createElement(Flex, {
            justify: Flex.Justify.END
        }, React.createElement(
            Button, {
                color: Button.Colors.GREEN,
                look: Button.Looks.FILLED,
                onClick: () => createFriendInvite().then((invite) => setInvites([...invites, invite]))
            },
            "Create Friend Code"
        ), React.createElement(
            Button, {
                style: {
                    marginLeft: "8px"
                },
                color: Button.Colors.RED,
                look: Button.Looks.OUTLINED,
                disabled: !invites.length,
                onClick: () => revokeFriendInvites().then(setInvites([]))
            },
            "Revoke all Friend Codes"
        ))
    ), loading ? React.createElement(
        Text, {
            variant: "heading-md/semibold",
            className: styles.panelText
        },
        "Loading..."
    ) : invites.length === 0 ? React.createElement(
        Text, {
            variant: "heading-md/semibold",
            className: styles.panelText
        },
        "You don't have any friend codes yet"
    ) : React.createElement("div", null, invites.map((invite) => React.createElement(FriendCodeCard, {
        key: invite.code,
        invite
    }))));
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
        this.patchAddFriendsPanel();
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
        }, item.title), item.items.map((item2) => React.createElement("span", null, item2))));
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
    patchAddFriendsPanel() {
        const [Module, Key] = Webpack.getWithKey(Webpack.Filters.byStrings(".Fragment", ".emptyState", ".ADD_FRIEND"));
        Patcher.after(Module, Key, (_, __, res) => {
            res.props.children.splice(1, 0, React.createElement(ErrorBoundary, {
                key: "FriendCodesPanel",
                id: "FriendCodesPanel"
            }, React.createElement(FriendCodesPanel, null)));
        });
    }
}

/*@end */

module.exports = FriendCodes;