/**
 * @name ReplaceTimestamps
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.0.0
 * @description Replaces plaintext 24 hour timestamps into Discord's timestamps
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ReplaceTimestamps
 * @updateUrl https://betterdiscord.app/gh-redirect/?id=
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
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
        version: "1.0.0",
        description:
            "Replaces plaintext 24 hour timestamps into Discord's timestamps",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ReplaceTimestamps",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ReplaceTimestamps/ReplaceTimestamps.plugin.js",
    },
    changelog: [
        {
            title: "YEAH",
            type: "added",
            items: ["The plugin exists"],
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
        stop() { }
    }
    : (([Plugin, Library]) => {
        const { Patcher, DiscordModules } = Library;
        return class ReplaceTimestamps extends Plugin {
            onStart() {
                this.patchMessage();
            }

            patchMessage() {
                Patcher.before(DiscordModules.MessageActions, "sendMessage", (_, [, msg]) => {
                    if (msg.content.search(/(?<!\d)\d{1,2}:\d{2}(?!\d)/) !== -1) msg.content = msg.content.replace(/\d?\d:\d\d/g, x => (this.getUnixTimestamp(x)));
                })
            }

            getUnixTimestamp(time) {
                const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/\d?\d:\d\d/, time);
                const then = Math.round((new Date(date)).getTime() / 1000);
                if (isNaN(then)) return time;
                return `<t:${then}:t>`;
            }

            onStop() {
                Patcher.unpatchAll();
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));