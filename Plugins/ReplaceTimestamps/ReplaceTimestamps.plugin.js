/**
 * @name ReplaceTimestamps
 * @author domi.btnr
 * @authorId 354191516979429376
 * @version 1.2.1
 * @description Replaces plaintext 24 hour timestamps into Discord's timestamps
 * @invite gp2ExK5vc7
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/main/Plugins/ReplaceTimestamps
 * @donate https://paypal.me/domibtnr
 */

const BD = new BdApi("ReplaceTimestamps");
const MessageActions = BD.Webpack.getByKeys("sendMessage");

const getUnixTimestamp = (time, format = "t") => {
    const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "").replace(/\d?\d:\d\d/, time);
    const then = Math.round((new Date(date)).getTime() / 1000);
    if (isNaN(then)) return time;
    return `<t:${then}:${format}>`;
}

module.exports = _ => ({
    start() {
        BD.Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            const regexAGlobal = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?(t|T|d|D|f|F|R)?/gi;
            const regexA = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?(t|T|d|D|f|F|R)?/i;
            if (msg.content.search(regexAGlobal) !== -1) msg.content = msg.content.replace(regexAGlobal, x => {
                let [, time, mode, format] = x.match(regexA);
                let [hours, minutes] = time.split(":").map(e => parseInt(e));
                if (mode && mode.toLowerCase() === "pm" && hours < 12 && hours !== 0) {
                    hours += 12;
                    minutes = minutes.toString().padStart(2, "0");
                    time = `${hours}:${minutes}`;
                } else if ((mode && mode.toLowerCase() === "am" && hours === 12) || (hours === 24)) time = `00:${minutes}`;
                else if (minutes >= 60) {
                    hours += Math.floor(minutes / 60);
                    minutes = (minutes % 60);
                    time = `${hours}:${minutes}`;
                }
                return getUnixTimestamp(time, format);
            });
        });
    },
    stop() {
        BD.Patcher.unpatchAll();
    }
});
