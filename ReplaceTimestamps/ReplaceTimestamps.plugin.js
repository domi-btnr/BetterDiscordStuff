/**
 * @name ReplaceTimestamps
 * @version 1.4.3
 * @description Replaces plaintext times and dates into Discord's timestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ReplaceTimestamps
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

/* @manifest */
const manifest = {
    "$schema": "../common/Schemas/manifest.schema.json",
    "name": "ReplaceTimestamps",
    "version": "1.4.3",
    "description": "Replaces plaintext times and dates into Discord's timestamps",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/ReplaceTimestamps",
    "changelog": [{
        "title": "Fixed Settings",
        "type": "fixed",
        "items": [
            "Settings open again"
        ]
    }],
    "changelogDate": "2026-01-26"
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
  margin-bottom: 16px;
}
.Changelog-Item .Changelog-Header {
  display: flex;
  text-transform: uppercase;
  font-weight: 700;
  align-items: center;
  margin-bottom: 10px;
}
.Changelog-Item .Changelog-Header.added {
  color: #45ba6a;
}
.Changelog-Item .Changelog-Header.changed {
  color: #f0b232;
}
.Changelog-Item .Changelog-Header.fixed {
  color: #ec4245;
}
.Changelog-Item .Changelog-Header.improved {
  color: #5865f2;
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

/* react */
var React = BdApi.React;

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
    "changelogImage" in manifest && items.unshift(React.createElement("img", {
        className: "Changelog-Banner",
        src: manifest.changelogImage
    }));
    UI.alert(title, items);
    Data.save("lastVersion", manifest.version);
}

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
    get(key, def = null) {
        return this._settings[key] ?? def;
    }
    set(key, value) {
        this._settings[key] = value;
        Data.save("SETTINGS", this._settings);
        this.emitChange();
    }
}();

/* ../common/Settings/panel.tsx */
const {
    SettingItem,
    SwitchInput
} = Components;
const Select = Webpack.getByStrings('selectionMode:"single",onSelectionChange:', "isSelected:", {
    searchExports: true
});
const Slider = Webpack.getByStrings("stickToMarkers");

function DropdownItem(props) {
    return React.createElement(ErrorBoundary, {
        key: props.id,
        id: props.id
    }, React.createElement(SettingItem, {
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

function SwitchItem(props) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(ErrorBoundary, {
        key: props.id,
        id: props.id
    }, React.createElement(SettingItem, {
        ...props,
        inline: true
    }, React.createElement(SwitchInput, {
        value,
        onChange: (v) => Settings.set(props.id, v)
    })));
}

function SliderItem(props) {
    if (!Slider) return null;
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return React.createElement(ErrorBoundary, {
        key: props.id,
        id: props.id
    }, React.createElement(SettingItem, {
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

function SettingsPanel(props) {
    const ComponentMap = {
        dropdown: DropdownItem,
        switch: SwitchItem,
        slider: SliderItem
    };
    return props.items.map((item) => {
        const Component = ComponentMap[item.type];
        return Component ? React.createElement(Component, {
            ...item
        }) : null;
    });
}

/* modules/utils.js */
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
        const day = parseInt(dateMatch[dayIndex + 1]);
        const month = parseInt(dateMatch[monthIndex + 1]);
        const year = parseInt(dateMatch[yearIndex + 1]);
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

/* settings.json */
var items = [{
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
    },
    {
        type: "switch",
        name: "Apply to Message Edits",
        note: "Whether to also convert timestamps when editing messages",
        id: "applyToEdits",
        value: true
    }
];
var SettingsItems = {
    items: items
};

/* index.jsx */
exports.timeRegexMatch = void 0;
exports.dateRegexMatch = void 0;
exports.relativeRegexMatch = void 0;
class ReplaceTimestamps {
    start() {
        showChangelog(manifest);
        this.patchMessageActions();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
    patchMessageActions() {
        const MessageActions = Webpack.getByKeys("sendMessage", "editMessage");
        const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
        exports.timeRegexMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
        const dateFormat = Settings.get("dateFormat", "dd.MM.yyyy").replace(/[./]/g, "[./]").replace("dd", "(\\d{2})").replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");
        const dateRegex = new RegExp(`${dateFormat}`, "gi");
        exports.dateRegexMatch = new RegExp(`${dateFormat}`, "i");
        const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
        const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");
        const relativeRegex = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/gi;
        exports.relativeRegexMatch = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/i;
        const processMessageContent = (content) => content.replace(TimeDateRegex, (x) => getUnixTimestamp(x)).replace(DateRegexTime, (x) => getUnixTimestamp(x)).replace(timeRegex, (x) => getUnixTimestamp(x, "t")).replace(dateRegex, (x) => getUnixTimestamp(x, "d")).replace(relativeRegex, getRelativeTime);
        Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            msg.content = processMessageContent(msg.content);
        });
        Patcher.before(MessageActions, "editMessage", (_, [, , msg]) => {
            if (!Settings.get("applyToEdits", true)) return;
            msg.content = processMessageContent(msg.content);
        });
    }
    getSettingsPanel() {
        return React.createElement(SettingsPanel, {
            items: SettingsItems.items
        });
    }
}

exports.default = ReplaceTimestamps;