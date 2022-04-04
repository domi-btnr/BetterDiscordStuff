/**
 * @name SuppressPings
 * @author HypedDomi
 * @authorId 354191516979429376
 * @version 1.0.0
 * @description Suppresses mentions from messages
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/SuppressPings
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "SuppressPings",
        authors: [
            {
                name: "HypedDomi",
                discord_id: "354191516979429376",
                github_username: "HypedDomi"
            }
        ],
        version: "1.0.0",
        description:
            "Suppresses mentions from messages",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/SuppressPings",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/SuppressPings/SuppressPings.plugin.js",
    },
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
        const { Patcher } = Library;
        const Dispatcher = BdApi.findModuleByProps("dirtyDispatch");
        const UserUtils = BdApi.findModuleByProps("getCurrentUser");
        class SuppressPings extends Plugin {
            constructor() {
                super();
                this.getSettingsPanel = () => {
                    return this.buildSettingsPanel().getElement();
                };
            }
            onStart() {
                this.patchMessages();
            }

            patchMessages() {
                Patcher.before(Dispatcher, "dispatch", (_, [action]) => {
                    if (action.type !== "MESSAGE_CREATE") return;
                    const { message } = action;
                    const currentUser = UserUtils.getCurrentUser();
                    if (!currentUser || !Array.isArray(message.mentions)) return;
                    const mentionIndex = message.mentions.findIndex(e => e.id === currentUser.id);
                    if (mentionIndex === -1) return;
                    message.mentions.splice(mentionIndex, 1);
                });
            }

            onStop() {
                Patcher.unpatchAll();
            }
        }
        return SuppressPings;
    })(global.ZeresPluginLibrary.buildPlugin(config));