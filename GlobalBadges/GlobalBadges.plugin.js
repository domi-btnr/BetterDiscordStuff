/**
 * @name GlobalBadges
 * @version 1.0.5
 * @description Adds global badges from other client mods
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/GlobalBadges
 */

'use strict';

/* @manifest */
const manifest = {
    "$schema": "../common/Schemas/manifest.schema.json",
    "name": "GlobalBadges",
    "version": "1.0.5",
    "description": "Adds global badges from other client mods",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/GlobalBadges",
    "changelog": {
        "date": "2026-01-25",
        "changes": [{
            "type": "fixed",
            "title": "Fixed",
            "items": [
                "Plugin fixed for the latest Discord update"
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
    Patcher,
    UI,
    Webpack
} = new BdApi(manifest.name);

/* react */
var React = BdApi.React;

/* ../common/Changelog/footer.tsx */
const {
    Text
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
    return React.createElement(Text, null, "Need support?", " ", manifest.invite && React.createElement(React.Fragment, null, "Join the", " ", React.createElement("a", {
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
        onClose: () => Data.save("lastVersion", manifest.version),
        footer: React.createElement(Footer, {
            manifest
        })
    });
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
                    hunter: "Bug Hunter",
                    early: "Early User"
                };
                badge = {
                    name: fullNames[badge] || badge,
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

/* settings.json */
var items = [{
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
var SettingsItems = {
    items: items
};

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
        const [BadgeList, Key_BL] = Webpack.getWithKey(
            Webpack.Filters.byStrings("badges", "badgeClassName", ".BADGE")
        );
        Patcher.after(BadgeList, Key_BL, (_, args, res) => {
            const [{
                displayProfile
            }] = args;
            if (!displayProfile?.userId) return;
            res.props.children.unshift(React.createElement(GlobalBadges$1, {
                userId: displayProfile.userId
            }));
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, {
            items: SettingsItems.items
        });
    }
}

module.exports = GlobalBadges;