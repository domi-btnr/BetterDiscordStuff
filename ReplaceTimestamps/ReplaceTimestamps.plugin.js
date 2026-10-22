/**
 * @name ReplaceTimestamps
 * @version 1.4.4
 * @description Replaces plaintext times and dates into Discord's timestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ReplaceTimestamps
 */

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

/* @manifest */
const manifest = {
    $schema: "../../common/Schemas/manifest.schema.json",
    name: "ReplaceTimestamps",
    version: "1.4.4",
    description: "Replaces plaintext times and dates into Discord's timestamps",
    author: "domi.btnr",
    authorId: "354191516979429376",
    invite: "gp2ExK5vc7",
    donate: "https://paypal.me/domibtnr",
    source: "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/src/plugins/ReplaceTimestamps",
    changelog: {
        date: "2026-05-15",
        changes: [
            {
                type: "fixed",
                title: "Fixed Settings",
                items: ["Settings open again"]
            }
        ]
    }
};

/* @api */
const { Components, Data, Hooks, Logger, Patcher, UI, Webpack } = new BdApi(manifest.name);

/* ../../common/Webpack/Dispatcher.ts */
const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", "_actionHandlers", {
    searchExports: true
});

/* ../../common/Webpack/Flux.ts */
const Flux = Webpack.getByKeys("Store");

/* ../../common/Webpack/MessageActions.ts */
const MessageActions = Webpack.getByKeys("sendMessage", "editMessage");

/* ../../common/i18n/index.ts */
function getLocale() {
    return Webpack.getStore("LocaleStore").locale;
}

/* ../../common/Changelog/footer.tsx */
const { Text } = Components;

function Footer({ manifest }) {
    if (!manifest.invite && !manifest.source) return null;
    let issuesUrl;
    if (manifest.source) {
        const url = new URL(manifest.source);
        const [, owner, repo] = url.pathname.split("/");
        url.pathname = `/${owner}/${repo}/issues`;
        issuesUrl = url.toString();
    }
    return BdApi.React.createElement(
        Text,
        null,
        "Need support?",
        " ",
        manifest.invite
            && BdApi.React.createElement(
                BdApi.React.Fragment,
                null,
                "Join the",
                " ",
                BdApi.React.createElement(
                    "a",
                    { onClick: () => UI.showInviteModal(manifest.invite), style: { textDecoration: "underline" } },
                    "Discord Server"
                ),
                manifest.source && " or "
            ),
        manifest.source
            && BdApi.React.createElement(
                BdApi.React.Fragment,
                null,
                "Check for Issues on",
                " ",
                BdApi.React.createElement(
                    "a",
                    { href: issuesUrl, target: "_blank", rel: "noreferrer", style: { textDecoration: "underline" } },
                    "GitHub"
                )
            )
    );
}

/* ../../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog) return;
    const { date, title, subtitle, ...changelog } = manifest.changelog;
    if (!changelog.changes?.length && !changelog.blurb && !changelog.video && !changelog.banner) return;
    const formatter = new Intl.DateTimeFormat(getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog,
        footer: BdApi.React.createElement(Footer, { manifest })
    });
    Data.save("lastVersion", manifest.version);
}

/* ../../common/ErrorBoundary/index.tsx */
const ErrorIcon = props =>
    BdApi.React.createElement(
        "svg",
        {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "#ddd",
            width: "24",
            height: "24",
            ...props
        },
        BdApi.React.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
        BdApi.React.createElement("path", {
            d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        })
    );

class ErrorBoundary extends BdApi.React.Component {
    state = { hasError: false, error: null, info: null };
    componentDidCatch(error, info) {
        this.setState({ error, info, hasError: true });
        Logger.error(
            `[ErrorBoundary:${this.props.id}] HI OVER HERE!! SHOW THIS SCREENSHOT TO THE DEVELOPER.
`,
            error
        );
    }
    render() {
        if (this.state.hasError) {
            return this.props.mini
                ? BdApi.React.createElement(ErrorIcon, { fill: "#f04747" })
                : BdApi.React.createElement(
                      "div",
                      { className: "errorBoundary" },
                      BdApi.React.createElement(
                          "div",
                          { className: "errorText" },
                          BdApi.React.createElement(
                              "span",
                              null,
                              "An error has occured while rendering ",
                              this.props.id,
                              "."
                          ),
                          BdApi.React.createElement(
                              "span",
                              null,
                              "Open console (",
                              BdApi.React.createElement("code", null, "CTRL + SHIFT + i / CMD + SHIFT + i"),
                              ') - Select the "Console" tab and screenshot the big red error.'
                          )
                      )
                  );
        } else return this.props.children;
    }
}

/* ../../common/Settings/store.ts */
const Settings = new (class Settings2 extends Flux.Store {
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
})();

/* ../../common/Settings/items/shared.tsx */
function BetaTag() {
    return BdApi.React.createElement(
        "span",
        {
            style: {
                display: "inline-flex",
                alignItems: "center",
                height: 16,
                marginLeft: "var(--space-4)",
                padding: "0 var(--space-8)",
                borderRadius: "var(--radius-round)",
                background: "var(--badge-primary-background)",
                color: "var(--badge-primary-text)",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: "16px",
                textTransform: "uppercase"
            }
        },
        "Beta"
    );
}

function Warning({ children }) {
    return BdApi.React.createElement(
        "div",
        {
            style: {
                marginTop: 8,
                padding: "6px 10px",
                borderRadius: 4,
                border: "1px solid var(--border-feedback-warning)",
                background: "var(--background-feedback-warning)",
                color: "var(--text-default)",
                fontSize: 14,
                lineHeight: "18px"
            }
        },
        children
    );
}

function getItemLabels({ name, note, isBeta, warning }) {
    return {
        name: isBeta
            ? BdApi.React.createElement(BdApi.React.Fragment, null, name, BdApi.React.createElement(BetaTag, null))
            : name,
        note: warning
            ? BdApi.React.createElement(
                  BdApi.React.Fragment,
                  null,
                  note,
                  BdApi.React.createElement(Warning, null, warning)
              )
            : note
    };
}

/* ../../common/Settings/items/dropdown.tsx */
const { SettingItem: SettingItem$2 } = Components;

const Select = Webpack.getByStrings('selectionMode:"single",onSelectionChange:', "clear:()=>", {
    searchExports: true
});

function DropdownItem({ isBeta, warning, ...props }) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    const options = props.options.map(option =>
        typeof option === "string" ? { label: option, value: option } : option
    );
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: props.id },
        BdApi.React.createElement(
            SettingItem$2,
            { ...props, ...getItemLabels({ ...props, isBeta, warning }), inline: true },
            BdApi.React.createElement(
                "div",
                { style: { width: 200, flexShrink: 0 } },
                BdApi.React.createElement(Select, {
                    closeOnSelect: true,
                    options,
                    value,
                    onChange: v => Settings.set(props.id, v),
                    renderOptionLabel: option => option.label
                })
            )
        )
    );
}

/* ../../common/Settings/items/slider.tsx */
const { SettingItem: SettingItem$1 } = Components;
const Slider = Webpack.getByStrings("stickToMarkers", "moveStaggered", { searchExports: true });

function SliderItem({ isBeta, warning, ...props }) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value ?? props.defaultValue));
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: props.id },
        BdApi.React.createElement(
            SettingItem$1,
            { ...props, ...getItemLabels({ ...props, isBeta, warning }) },
            BdApi.React.createElement(Slider, {
                ...props,
                handleSize: 10,
                initialValue: value,
                defaultValue: props.defaultValue,
                minValue: props.minValue,
                maxValue: props.maxValue,
                onValueChange: value2 => Settings.set(props.id, Math.round(value2)),
                onValueRender: value2 => Math.round(value2)
            })
        )
    );
}

/* ../../common/Settings/items/switch.tsx */
const { SettingItem, SwitchInput } = Components;

function SwitchItem({ isBeta = false, disabled = false, warning, ...props }) {
    const stored = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    const value = disabled ? false : stored;
    return BdApi.React.createElement(
        ErrorBoundary,
        { id: props.id },
        BdApi.React.createElement(
            SettingItem,
            { ...props, ...getItemLabels({ ...props, isBeta, warning }), inline: true },
            BdApi.React.createElement(SwitchInput, { value, disabled, onChange: v => Settings.set(props.id, v) })
        )
    );
}

/* ../../common/Settings/panel.tsx */
function SettingsPanel({ items, components: customComponents }) {
    const ComponentMap = {
        dropdown: DropdownItem,
        switch: SwitchItem,
        slider: SliderItem,
        ...customComponents
    };
    return items.map(item => {
        const Component = ComponentMap[item.type];
        return Component ? BdApi.React.createElement(Component, { key: item.id, ...item }) : null;
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
        let [hours, minutes] = timeMatch[1].split(":").map(e => parseInt(e));
        if (timeMatch[2] && timeMatch[2].toLowerCase() === "pm" && hours < 12 && hours !== 0) {
            hours += 12;
            minutes = minutes.toString().padStart(2, "0");
        } else if ((timeMatch[2] && timeMatch[2].toLowerCase() === "am" && hours === 12) || hours === 24) {
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

const getRelativeTime = str => {
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
const items = [
    {
        type: "dropdown",
        name: "Date Format",
        note: "Select the date format for converting dates to timestamps",
        id: "dateFormat",
        options: [
            {
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

const SettingsItems = {
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
    }
    stop() {
        Patcher.unpatchAll();
    }
    patchMessageActions() {
        const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
        exports.timeRegexMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
        const dateFormat = Settings.get("dateFormat", "dd.MM.yyyy")
            .replace(/[./]/g, "[./]")
            .replace("dd", "(\\d{2})")
            .replace("MM", "(\\d{2})")
            .replace("yyyy", "(\\d{4})");
        const dateRegex = new RegExp(`${dateFormat}`, "gi");
        exports.dateRegexMatch = new RegExp(`${dateFormat}`, "i");
        const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
        const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");
        const relativeRegex = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/gi;
        exports.relativeRegexMatch = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/i;
        const processMessageContent = content =>
            content
                .replace(TimeDateRegex, x => getUnixTimestamp(x))
                .replace(DateRegexTime, x => getUnixTimestamp(x))
                .replace(timeRegex, x => getUnixTimestamp(x, "t"))
                .replace(dateRegex, x => getUnixTimestamp(x, "d"))
                .replace(relativeRegex, getRelativeTime);
        Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            msg.content = processMessageContent(msg.content);
        });
        Patcher.before(MessageActions, "editMessage", (_, [, , msg]) => {
            if (!Settings.get("applyToEdits", true)) return;
            msg.content = processMessageContent(msg.content);
        });
    }
    getSettingsPanel() {
        return BdApi.React.createElement(SettingsPanel, { items: SettingsItems.items });
    }
}

exports.default = ReplaceTimestamps;
