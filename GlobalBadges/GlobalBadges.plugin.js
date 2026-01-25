/**
 * @name GlobalBadges
 * @version 1.0.5
 * @description Adds global badges from other client mods
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/GlobalBadges
 * @changelogDate 2026-01-25
 */

'use strict';

/* @manifest */
const manifest = {
    "name": "GlobalBadges",
    "version": "1.0.5",
    "description": "Adds global badges from other client mods",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/GlobalBadges",
    "changelog": [{
        "title": "Fixed",
        "type": "fixed",
        "items": [
            "Plugin fixed for the latest Discord update"
        ]
    }],
    "changelogDate": "2026-01-25"
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

/* modules/fetchBadges.ts */
const API_URL = "https://api.domi-btnr.dev/clientmodbadges";
const cache = new Map();
const EXPIRES = 1e3 * 60 * 15;
async function fetchBadges(id) {
    const cachedValue = cache.get(id);
    if (!cache.has(id) || cachedValue && cachedValue.expires < Date.now()) {
        const resp = await fetch(`${API_URL}/users/${id}`);
        const body = await resp.json();
        cache.set(id, {
            badges: body,
            expires: Date.now() + EXPIRES
        });
        return body;
    } else if (cachedValue) {
        return cachedValue.badges;
    }
}

/* modules/settings.js */
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

/* components/globalBadges.tsx */
function GlobalBadges$1(props) {
    const {
        userId
    } = props;
    const [badges, setBadges] = React.useState({});
    React.useEffect(() => {
        fetchBadges(userId).then(setBadges);
    }, []);
    if (!badges || !Object.keys(badges).length) return null;
    const globalBadges = [];
    Object.keys(badges).forEach((mod) => {
        badges[mod].forEach((badge) => {
            if (typeof badge === "string") {
                const fullNames = {
                    "hunter": "Bug Hunter",
                    "early": "Early User"
                };
                badge = {
                    name: fullNames[badge] ? fullNames[badge] : badge,
                    badge: `${API_URL}/badges/${mod}/${badge.toLowerCase()}`
                };
            } else if (typeof badge === "object") badge.custom = true;
            if (!Settings.get("showCustomBadges", true) && badge.custom) return;
            const cleanName = badge.name.replace(mod, "").trim();
            const prefix = Settings.get("showPrefix", true) ? mod : "";
            if (!badge.custom) badge.name = `${prefix} ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
            globalBadges.push(
                React.createElement(Components.Tooltip, {
                    text: badge.name
                }, (props2) => React.createElement(
                    "img", {
                        ...props2,
                        src: badge.badge,
                        style: {
                            width: "20px",
                            height: "20px",
                            margin: "0 -1px",
                            transform: badge.badge.includes("Replugged") ? "scale(0.85)" : "scale(0.9)"
                        }
                    }
                ))
            );
        });
    });
    return React.createElement(React.Fragment, null, globalBadges);
}

/* modules/settings.json */
var SettingsItems = [{
        type: "switch",
        name: "Show Prefix",
        note: "Whether to show the Mod Name as a prefix on the badge",
        id: "showPrefix",
        value: true
    },
    {
        type: "switch",
        name: "Show Custom Badges",
        note: "Whether you want to see custom badges or not",
        id: "showCustomBadges",
        value: true
    }
];

/* components/settings.jsx */
const {
    SettingItem,
    SwitchInput
} = Components;
const useStateFromStores = Webpack.getByStrings("useStateFromStores", {
    searchExports: true
});

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

/* index.tsx */
class GlobalBadges {
    start() {
        showChangelog(manifest);
        this.patchBadges();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    patchBadges() {
        const [BadgeList, Key_BL] = Webpack.getWithKey(Webpack.Filters.byStrings("badges", "badgeClassName", ".BADGE"));
        Patcher.after(BadgeList, Key_BL, (_, [{
            displayProfile
        }], res) => {
            if (!displayProfile?.userId) return;
            res.props.children.unshift(
                React.createElement(GlobalBadges$1, {
                    userId: displayProfile.userId
                })
            );
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, null);
    }
}

module.exports = GlobalBadges;