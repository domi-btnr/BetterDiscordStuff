/**
 * @name BetterInvites
 * @version 1.6.7
 * @description Shows some useful information in the invitation
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/BetterInvites
 * @changelogDate 2025-04-06
 */

'use strict';

/* @manifest */
const manifest = {
    "name": "BetterInvites",
    "version": "1.6.7",
    "description": "Shows some useful information in the invitation",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/BetterInvites",
    "changelog": [{
        "title": "Fixed",
        "type": "fixed",
        "items": ["Plugin fixed for the latest Discord update"]
    }],
    "changelogDate": "2025-04-06"
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
        type: "dropdown",
        name: "Banner Type",
        note: "Select what Banner to use",
        id: "bannerType",
        options: [{
                label: "BetterInvites",
                value: "BetterInvites"
            },
            {
                label: "Discord Invite Splash",
                value: "discordInviteSplash"
            }
        ],
        value: "BetterInvites"
    },
    {
        type: "switch",
        name: "Show Guild Description",
        note: "Whether to show the Guild description in the Invite",
        id: "showGuildDescription",
        value: true
    },
    {
        type: "switch",
        name: "Show Boost Level",
        note: "Whether to show the Boost Level in the Invite",
        id: "showBoostLevel",
        value: true
    },
    {
        type: "switch",
        name: "Show Inviter",
        note: "Whether to show the Inviter in the Invite",
        id: "showInviter",
        value: true
    },
    {
        type: "switch",
        name: "Show Verification Level",
        note: "Whether to show the Verification Level in the Invite",
        id: "showVerificationLevel",
        value: true
    },
    {
        type: "switch",
        name: "Show NSFW",
        note: "Whether to show if the Guild is marked as NSFW",
        id: "showNSFW",
        value: true
    },
    {
        type: "switch",
        name: "Show Invite Expiration",
        note: "Whether to when the Invite expires",
        id: "showInviteExpiry",
        value: true
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
const useStateFromStores = Webpack.getByStrings("useStateFromStores", {
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
class BetterInvites {
    start() {
        showChangelog(manifest);
        this.patchInvite();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    patchInvite() {
        const [Invite, Key] = Webpack.getWithKey(Webpack.Filters.byStrings(".INVITE_EMBED", ".IS_GUEST_INVITE"));
        const Styles2 = Webpack.getByKeys("markup");
        Patcher.after(Invite, Key, (_, [props], res) => {
            const guild = res.props.children[0].props.guild;
            const inviter = props.invite.inviter;
            let expireTooltip;
            if (Settings.get("showInviteExpiry", true) && props.invite.expires_at) {
                const expiresAt = new Date(props.invite.expires_at);
                const expiresIn = expiresAt - Date.now();
                const days = Math.floor(expiresIn / 1e3 / 60 / 60 / 24);
                const hours = Math.floor(expiresIn / 1e3 / 60 / 60);
                const minutes = Math.floor(expiresIn / 1e3 / 60);
                if (days > 0) expireTooltip = `${days} day${days !== 1 ? "s" : ""}`;
                else if (hours > 0) expireTooltip = `${hours} hour${hours !== 1 ? "s" : ""}`;
                else expireTooltip = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
            }
            if (Settings.get("showBoostLevel", true) || Settings.get("showInviter", true) || Settings.get("showVerificationLevel", true) || Settings.get("showNSFW", true) || Settings.get("showInviteExpiry", true)) {
                res.props.children[2].props.children.splice(
                    1,
                    0,
                    React.createElement("div", {
                        className: `${manifest.name}-iconWrapper`,
                        style: {
                            display: "grid",
                            grid: "auto / auto auto",
                            direction: "rtl",
                            "grid-gap": "3px"
                        }
                    }, Settings.get("showBoostLevel", true) && guild.premiumTier > 0 && React.createElement(Components.Tooltip, {
                        text: `Boost Level ${guild.premiumTier}`
                    }, (props2) => React.createElement("img", {
                        ...props2,
                        style: {
                            height: "28px",
                            borderRadius: "5px",
                            objectFit: "contain"
                        },
                        src: "https://discord.com/assets/4a2618502278029ce88adeea179ed435.svg"
                    })), Settings.get("showInviter", true) && inviter && React.createElement(Components.Tooltip, {
                        text: `Invited by ${inviter.username}`
                    }, (props2) => React.createElement(
                        "img", {
                            ...props2,
                            style: {
                                height: "28px",
                                borderRadius: "5px",
                                objectFit: "contain"
                            },
                            src: `https://cdn.discordapp.com/avatars/${inviter?.id}/${inviter?.avatar}.png?size=1024`,
                            onError: (e) => {
                                e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                            },
                            onClick: () => {
                                DiscordNative.clipboard.copy(inviter.id);
                                UI.showToast("Copied ID", {
                                    type: "info",
                                    icon: true,
                                    timeout: 4e3
                                });
                            }
                        }
                    )), Settings.get("showVerificationLevel", true) && guild.verificationLevel > 0 && React.createElement(Components.Tooltip, {
                        text: `Verification Level ${guild.verificationLevel}`
                    }, (props2) => React.createElement("img", {
                        ...props2,
                        style: {
                            height: "28px",
                            borderRadius: "5px",
                            objectFit: "contain"
                        },
                        src: "https://discord.com/assets/e62b930d873735bbede7ae1785d13233.svg"
                    })), Settings.get("showNSFW", true) && guild.nsfw_level && React.createElement(Components.Tooltip, {
                        text: "NSFW"
                    }, (props2) => React.createElement("img", {
                        ...props2,
                        style: {
                            height: "28px",
                            borderRadius: "5px",
                            objectFit: "contain"
                        },
                        src: "https://discord.com/assets/ece853d6c1c1cd81f762db6c26fade40.svg"
                    })), Settings.get("showInviteExpiry", true) && props.invite.expires_at && React.createElement(Components.Tooltip, {
                        text: `Invite expires in ${expireTooltip}`
                    }, (props2) => React.createElement("img", {
                        ...props2,
                        style: {
                            height: "28px",
                            borderRadius: "5px",
                            objectFit: "contain"
                        },
                        src: "https://discord.com/assets/7a844e444413cf4c3c46.svg"
                    })))
                );
                res.props.children[2].props.children[0].props.style = {
                    "max-width": "80%"
                };
            }
            if (Settings.get("showGuildDescription", true) && guild.description) {
                const index = res.props.children[2].props.children.findIndex((e) => e.type.displayName === "InviteButton.Button");
                res.props.children[2].props.children.splice(
                    index,
                    0,
                    React.createElement("div", {
                        className: `${manifest.name}-guildDescription`,
                        style: {
                            marginTop: "-14px",
                            width: "100%"
                        }
                    }, React.createElement("div", {
                        className: Styles2.markup
                    }, guild.description))
                );
            }
            if (Settings.get("bannerType", "BetterInvites") === "BetterInvites" && guild.banner) {
                if (guild.features.has("INVITE_SPLASH")) res.props.children.splice(0, 1);
                res.props.children.splice(
                    1,
                    0,
                    React.createElement("div", {
                        className: `${manifest.name}-banner`,
                        style: {
                            position: "relative",
                            borderRadius: "4px",
                            height: "92px",
                            margin: "-6px 0 8px 0",
                            overflow: "hidden"
                        }
                    }, React.createElement(
                        "img", {
                            style: {
                                display: "block",
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            },
                            src: `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.gif?size=1024`,
                            onError: (e) => {
                                e.target.onError = null;
                                e.target.src = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024`;
                            }
                        }
                    ))
                );
            }
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, null);
    }
}

module.exports = BetterInvites;