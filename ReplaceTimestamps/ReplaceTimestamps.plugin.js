/**
 * @name ReplaceTimestamps
 * @version 1.3.2
 * @description Replaces plaintext times and dates into Discord's timestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ReplaceTimestamps
 * @changelogDate 2024-12-28
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
    "version": "1.3.2",
    "description": "Replaces plaintext times and dates into Discord's timestamps",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ReplaceTimestamps",
    "changelog": [{
        "title": "Improvement",
        "type": "improved",
        "items": [
            "Code improvements"
        ]
    }],
    "changelogDate": "2024-12-28"
};
/*@end */

/* @module @api */
const {
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
    FormDivider,
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
const getRelativeTime = (str) => {
    console.log(str);
    const timeMatch = str.match(exports.relativeRegexMatch);
    if (!timeMatch) return str;
    const now = new Date();
    let future = false;
    let value, unit;
    if (timeMatch[1] && timeMatch[2]) {
        value = parseInt(timeMatch[1]);
        unit = timeMatch[2];
        future = true;
    } else if (timeMatch[3] && timeMatch[4]) {
        value = parseInt(timeMatch[3]);
        unit = timeMatch[4];
        future = false;
    }
    if (isNaN(value)) return str;
    const adjustDate = (date, value2, unit2, future2) => {
        switch (unit2.toLowerCase()) {
            case "s":
                date.setSeconds(date.getSeconds() + (future2 ? value2 : -value2));
                break;
            case "m":
                date.setMinutes(date.getMinutes() + (future2 ? value2 : -value2));
                break;
            case "h":
                date.setHours(date.getHours() + (future2 ? value2 : -value2));
                break;
            case "d":
                date.setDate(date.getDate() + (future2 ? value2 : -value2));
                break;
            case "w":
                date.setDate(date.getDate() + (future2 ? value2 * 7 : -value2 * 7));
                break;
            case "mo":
                date.setMonth(date.getMonth() + (future2 ? value2 : -value2));
                break;
            case "y":
                date.setFullYear(date.getFullYear() + (future2 ? value2 : -value2));
                break;
        }
        return date;
    };
    const adjustedDate = adjustDate(now, value, unit, future);
    const then = Math.round(adjustedDate.getTime() / 1e3);
    return `<t:${then}:R>`;
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
.Changelog-Item .Changelog-Header.changed {
  color: #F0B232;
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
exports.relativeRegexMatch = void 0;
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
    patchSendMessage() {
        const MessageActions = Webpack.getByKeys("sendMessage");
        Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
            exports.timeRegexMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
            const dateFormat = Settings.get("dateFormat", "dd.MM.yyyy").replace(/[.\/]/g, "[./]").replace("dd", "(\\d{2})").replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");
            const dateRegex = new RegExp(`${dateFormat}`, "gi");
            exports.dateRegexMatch = new RegExp(`${dateFormat}`, "i");
            const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
            const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");
            const relativeRegex = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/gi;
            exports.relativeRegexMatch = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/i;
            msg.content = msg.content.replace(TimeDateRegex, (x) => getUnixTimestamp(x)).replace(DateRegexTime, (x) => getUnixTimestamp(x)).replace(timeRegex, (x) => getUnixTimestamp(x, "t")).replace(dateRegex, (x) => getUnixTimestamp(x, "d")).replace(relativeRegex, getRelativeTime);
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, null);
    }
}

/*@end */

exports.default = ReplaceTimestamps;