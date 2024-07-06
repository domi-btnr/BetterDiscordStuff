/**
 * @name ReplaceTimestamps
 * @version 1.3.0
 * @description Replaces plaintext times and dates into Discord's timestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ReplaceTimestamps
 * @changelogDate 2024-07-06
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

/* @module react */
const React = BdApi.React;
/*@end */

/* @module @manifest */
var manifest = {
    "name": "ReplaceTimestamps",
    "version": "1.3.0",
    "description": "Replaces plaintext times and dates into Discord's timestamps",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ReplaceTimestamps",
    "changelog": [],
    "changelogDate": "2024-07-06"
};
/*@end */

/* @module @api */
const {
    Net,
    Data,
    Patcher,
    ReactUtils,
    Utils,
    Webpack,
    UI,
    ContextMenu,
    DOM
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

/* @module settings.json */
var SettingsItems = [{
    type: "dropdown",
    name: "Date Format",
    note: "Select the date format for converting dates to timestamps",
    id: "dateFormat",
    options: [{
            label: "dd.MM.yyyy",
            value: "dd.MM.yyyy"
        },
        {
            label: "dd/MM/yyyy",
            value: "dd/MM/yyyy"
        },
        {
            label: "MM.dd.yyyy",
            value: "MM.dd.yyyy"
        },
        {
            label: "MM/dd/yyyy",
            value: "MM/dd/yyyy"
        },
        {
            label: "yyyy.MM.dd",
            value: "yyyy.MM.dd"
        },
        {
            label: "yyyy/MM/dd",
            value: "yyyy/MM/dd"
        }
    ],
    value: "dd.MM.yyyy"
}];
/*@end */

/* @module settings.jsx */
const {
    FormText,
    FormTitle,
    Select
} = Webpack.getByKeys("Select");

function Dropdown(props) {
    return React.createElement("div", {
        className: "settings-item"
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
    ));
}

function renderSettings(items) {
    return items.map((item) => {
        switch (item.type) {
            case "dropdown":
                return React.createElement(Dropdown, {
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

/* @module utils.js */
const getUnixTimestamp = (str, format) => {
    const timeMatch = str.match(exports.timeRegexMatch);
    const dateMatch = str.match(exports.dateRegexMatch);
    const formatParts = Settings.get("dateFormat", "dd.MM.yyyy").split(/[./]/);
    let dayIndex, monthIndex, yearIndex;
    formatParts.forEach((part, index) => {
        if (part.includes("dd")) dayIndex = index;
        if (part.includes("MM")) monthIndex = index;
        if (part.includes("yyyy")) yearIndex = index;
    });
    let date = new Date();
    if (dateMatch) {
        let day = parseInt(dateMatch[dayIndex + 1]);
        let month = parseInt(dateMatch[monthIndex + 1]);
        let year = parseInt(dateMatch[yearIndex + 1]);
        date = new Date(year, month - 1, day);
    }
    let time = date;
    if (timeMatch) {
        let [hours, minutes] = timeMatch[1].split(":").map((e) => parseInt(e));
        if (timeMatch[2] && timeMatch[2].toLowerCase() === "pm" && hours < 12 && hours !== 0) {
            hours += 12;
            minutes = minutes.toString().padStart(2, "0");
        } else if (timeMatch[2] && timeMatch[2].toLowerCase() === "am" && hours === 12 || hours === 24) {
            hours = 0;
        } else if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = (minutes % 60).toString().padStart(2, "0");
        }
        time = new Date(date);
        time.setHours(hours);
        time.setMinutes(minutes);
    }
    const then = Math.round(time.getTime() / 1e3);
    if (isNaN(then)) return str;
    return `<t:${then}${format ? `:${format}` : ""}>`;
};

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
exports.timeRegexMatch = void 0;
exports.dateRegexMatch = void 0;
class ReplaceTimestamps {
    start() {
        this.showChangelog();
        this.patchSendMessage();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    showChangelog() {
        if (!manifest.changelog.length || Settings.lastVersion === manifest.version) return;
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
    patchSendMessage() {
        const MessageActions = Webpack.getByKeys("sendMessage");
        Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
            const timeMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
            exports.timeRegexMatch = timeMatch;
            const dateFormat = Settings.get("dateFormat", "dd.MM.yyyy").replace(/[.\/]/g, "[./]").replace("dd", "(\\d{2})").replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");
            const dateRegex = new RegExp(`${dateFormat}`, "gi");
            const dateMatch = new RegExp(`${dateFormat}`, "i");
            exports.dateRegexMatch = dateMatch;
            const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
            const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");
            if (msg.content.search(TimeDateRegex) !== -1) {
                msg.content = msg.content.replace(TimeDateRegex, (x) => getUnixTimestamp(x));
            }
            if (msg.content.search(DateRegexTime) !== -1) {
                msg.content = msg.content.replace(DateRegexTime, (x) => getUnixTimestamp(x));
            }
            if (msg.content.search(timeRegex) !== -1) {
                msg.content = msg.content.replace(timeRegex, (x) => getUnixTimestamp(x, "t"));
            }
            if (msg.content.search(dateRegex) !== -1) {
                msg.content = msg.content.replace(dateRegex, (x) => getUnixTimestamp(x, "d"));
            }
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, null);
    }
}

/*@end */

exports.default = ReplaceTimestamps;