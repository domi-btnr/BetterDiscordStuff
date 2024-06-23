/**
 * @name ReplaceTimestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @version 1.3.0
 * @description Replaces plaintext times and dates into Discord's timestamps
 * @invite gp2ExK5vc7
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/main/Plugins/ReplaceTimestamps
 * @donate https://paypal.me/domibtnr
 */

const PLUGIN_NAME = "ReplaceTimestamps";

const BD = new BdApi(PLUGIN_NAME);
const MessageActions = BD.Webpack.getByKeys("sendMessage");

const DATE_FORMATS = ["dd.MM.yyyy", "dd/MM/yyyy", "MM.dd.yyyy", "MM/dd/yyyy", "yyyy.MM.dd", "yyyy/MM/dd"];
const DEFAULTS = { DATE_FORMAT: DATE_FORMATS[0] };
const SETTINGS = Object.assign({}, DEFAULTS, BD.Data.load("SETTINGS"));
let timeRegexMatch, dateRegexMatch;

const getUnixTimestamp = (str, format) => {
    const timeMatch = str.match(timeRegexMatch);
    const dateMatch = str.match(dateRegexMatch);

    const formatParts = SETTINGS.DATE_FORMAT.split(/[./]/);
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
        let [hours, minutes] = timeMatch[1].split(":").map(e => parseInt(e));
        if (timeMatch[2] && timeMatch[2].toLowerCase() === "pm" && hours < 12 && hours !== 0) {
            hours += 12;
            minutes = minutes.toString().padStart(2, "0");
        } else if ((timeMatch[2] && timeMatch[2].toLowerCase() === "am" && hours === 12) || (hours === 24)) {
            hours = 0;
        } else if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = (minutes % 60).toString().padStart(2, "0");
        }
        time = new Date(date);
        time.setHours(hours);
        time.setMinutes(minutes);
    }

    const then = Math.round(time.getTime() / 1000);
    if (isNaN(then)) return str;
    return `<t:${then}${format ? `:${format}` : ""}>`;
};

module.exports = _ => ({
    patchSendMessage() {
        BD.Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
            const timeMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
            timeRegexMatch = timeMatch;

            const dateFormat = SETTINGS.DATE_FORMAT.replace(/[.\/]/g, "[./]").replace("dd", "(\\d{2})").replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");
            const dateRegex = new RegExp(`${dateFormat}`, "gi");
            const dateMatch = new RegExp(`${dateFormat}`, "i");
            dateRegexMatch = dateMatch;

            const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
            const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");

            if (msg.content.search(TimeDateRegex) !== -1) {
                msg.content = msg.content.replace(TimeDateRegex, x => getUnixTimestamp(x));
            }
            if (msg.content.search(DateRegexTime) !== -1) {
                msg.content = msg.content.replace(DateRegexTime, x => getUnixTimestamp(x));
            }
            if (msg.content.search(timeRegex) !== -1) {
                msg.content = msg.content.replace(timeRegex, x => getUnixTimestamp(x, "t"));
            }
            if (msg.content.search(dateRegex) !== -1) {
                msg.content = msg.content.replace(dateRegex, x => getUnixTimestamp(x, "d"));
            }
        });
    },
    start() {
        this.patchSendMessage();
    },
    stop() {
        BD.Patcher.unpatchAll();
    },
    getSettingsPanel() {
        const dateFormats = DATE_FORMATS.map(e => `<option value="${e}" ${e === SETTINGS.DATE_FORMAT ? "selected" : ""}>${e}</option>`).join("");
        const dateFormatsDropdown = `
            <select id="${PLUGIN_NAME}_DROPDOWN" style="color:var(--text-normal); background-color:var(--input-background); border-color:var(--input-background); border-radius:4px; font-weight:500; padding:8px;">
                ${dateFormats}
            </select>
        `;

        setTimeout(() => {
            document.getElementById(`${PLUGIN_NAME}_DROPDOWN`).addEventListener("change", e => {
                SETTINGS.DATE_FORMAT = e.target.value;
                BD.Data.save("SETTINGS", SETTINGS);
                BD.Patcher.unpatchAll();
                this.patchSendMessage();
            });
        }, 250);

        return `
            <div style="display: flex; flex-direction: column;">
                <label style="color:var(--text-normal); font-weight:600; margin-bottom:5px;">Date Format</label>
                <p style="color: var(--header-secondary); font-size:14px; line-height:20px; font-weight:400; margin:0; margin-bottom:5px;">Select the date format for converting dates to timestamps</p>
                ${dateFormatsDropdown}
            </div>
        `;
    }
});
