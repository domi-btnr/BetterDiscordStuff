/**
 * @name ReplaceTimestamps
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.1.0
 * @description Replaces plaintext 24 hour timestamps into Discord's timestamps
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ReplaceTimestamps
 * @updateUrl https://betterdiscord.app/gh-redirect/?id=
 * @donate https://paypal.me/dominik1711
 * @website https://bd.bambus.me/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "ReplaceTimestamps",
        authors: [
            {
                name: "HypedDomi",
                discord_id: "354191516979429376",
            },
        ],
        version: "1.1.0",
        description:
            "Replaces plaintext 24 hour timestamps into Discord's timestamps",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ReplaceTimestamps",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ReplaceTimestamps/ReplaceTimestamps.plugin.js",
    },
    changelog: [
        {
            title: "AM/PM Support",
            type: "added",
            items: ["Added AM/PM support. To use, add `am` or `pm` to the end of the timestamp."],
        }
    ],
};

module.exports = !global.ZeresPluginLibrary
    ? class {
        constructor() {
            this._config = config;
        }

        load() {
            BdApi.showConfirmationModal(
                "Library plugin is needed",
                `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                {
                    confirmText: "Download",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        request.get(
                            "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                            (error, response, body) => {
                                if (error)
                                    return electron.shell.openExternal(
                                        "https://betterdiscord.app/Download?id=9"
                                    );

                                fs.writeFileSync(
                                    path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                                    body
                                );
                            }
                        );
                    },
                }
            );
        }
        start() {
            this.load();
        }
        stop() {}
    }
    : (([Plugin, Library]) => {
        const { Patcher, DiscordModules } = Library;
        return class ReplaceTimestamps extends Plugin {
            onStart() {
                this.patchMessage();
            }

            patchMessage() {
                Patcher.before(DiscordModules.MessageActions, "sendMessage", (_, [, msg]) => {
                    const regexAGlobal = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?(t|T|d|D|f|F|R)?/gi;
                    const regexA = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?(t|T|d|D|f|F|R)?/i;
                    if (msg.content.search(regexAGlobal) !== -1) msg.content = msg.content.replace(regexAGlobal, x => {
                        let [, time, mode, format] = x.match(regexA);
                        format = format ?? "t";
                        let [hours, minutes] = time.split(':').map(e => parseInt(e));
                        if (mode && mode.toLowerCase() === 'pm' && hours < 12 && hours !== 0) {
                            hours += 12;
                            minutes = minutes.toString().padStart(2, '0');
                            time = `${hours}:${minutes}`;
                        } else if ((mode && mode.toLowerCase() === 'am' && hours === 12) || (hours === 24)) time = `00:${minutes}`;
                        else if (minutes >= 60) {
                            hours += Math.floor(minutes / 60);
                            minutes = (minutes % 60);
                            time = `${hours}:${minutes}`;
                        }
                        return this.getUnixTimestamp(time, format);
                    });
                });
            }

            getUnixTimestamp(time, format) {
                const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/\d?\d:\d\d/, time);
                const then = Math.round((new Date(date)).getTime() / 1000);
                if (isNaN(then)) return time;
                return `<t:${then}:${format}>`;
            }

            onStop() {
                Patcher.unpatchAll();
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));
