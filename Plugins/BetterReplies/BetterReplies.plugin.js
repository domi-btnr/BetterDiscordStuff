/**
 * @name BetterReplies
 * @author HypedDomi
 * @authorId 354191516979429376
 * @version 1.0.1
 * @description Enhanced version of Strencher's SuppressReplies plugin
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/BetterReplies
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/BetterReplies/BetterReplies.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "BetterReplies",
        authors: [
            {
                name: "HypedDomi",
                discord_id: "354191516979429376",
                github_username: "HypedDomi"
            }
        ],
        version: "1.0.1",
        description:
            "Enhanced version of Strencher's SuppressReplies plugin",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/BetterReplies",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/BetterReplies/BetterReplies.plugin.js",
    },
    defaultConfig: [
        {
            type: "dropdown",
            id: "mentionSettings",
            name: "Mention Settings for Replies",
            value: 0,
            options: [
                { label: "Default", value: 0 },
                { label: "Suppress Mentions", value: 1 },
                { label: "Force Mentions", value: 2 },
            ]
        },
        {
            type: "switch",
            id: "autoDisableMention",
            name: "Disable Mention",
            note: "Automatically disables the 'Mention' option when replying to someone else.",
            value: true
        }

    ],
    changelog: [
        {
            title: "Fixed",
            type: "fixed",
            items: ["Fixed Dispatcher"],
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
        const { Patcher } = Library;
        const Dispatcher = BdApi.findModuleByProps("dirtyDispatch");
        const UserUtils = BdApi.findModuleByProps("getCurrentUser");
        class BetterReplies extends Plugin {
            constructor() {
                super();
                this.getSettingsPanel = () => {
                    return this.buildSettingsPanel().getElement();
                };
            }
            onStart() {
                this.patchMessages();
                this.patchCreateReply();
            }

            patchMessages() {
                Patcher.before(Dispatcher, "dispatch", (_, [action]) => {
                    if (action.type !== "MESSAGE_CREATE") return;
                    const { message } = action;
                    const currentUser = UserUtils.getCurrentUser();
                    if (!currentUser || !Array.isArray(message.mentions) || !message.referenced_message) return;
                    const mentionIndex = message.mentions.findIndex(e => e.id === currentUser.id);
                    // Suppress Mentions
                    if (this.settings.mentionSettings == 1) {
                        if (msgReference.author.id === currentUser.id && mentionIndex > -1) {
                            message.mentions.splice(mentionIndex, 1);
                            message.mentioned = false;
                        }

                        // Force Mentions
                    } else if (this.settings.mentionSettings == 2) {
                        if (msgReference.author.id === currentUser.id && mentionIndex === -1) {
                            message.mentions.push(currentUser.id);
                            message.mentioned = true;
                        }
                    }
                });
            }

            // Code from Strencher's SuppressReplies plugin
            patchCreateReply() {
                Patcher.before(BdApi.findModuleByProps("createPendingReply"), "createPendingReply", (_, [args]) => {
                    if (!this.settings.autoDisableMention) return;
                    args.shouldMention = false;
                });
            }

            onStop() {
                Patcher.unpatchAll();
            }
        }
        return BetterReplies;
    })(global.ZeresPluginLibrary.buildPlugin(config));