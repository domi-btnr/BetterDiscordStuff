/**
 * @name AllowedMentions
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 0.2.0
 * @description Allows you to mention people without pinging them
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/AllowedMentions
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/AllowedMentions/AllowedMentions.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "AllowedMentions",
        authors: [
            {
                name: "HypedDomi",
                discord_id: "354191516979429376",
            },
        ],
        version: "0.2.0",
        description:
            "Allows you to mention people without pinging them",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/AllowedMentions",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/AllowedMentions/AllowedMentions.plugin.js",
    },
    changelog: [
        {
            title: "FIXED",
            type: "fixed",
            items: ["Referencing to a message works now"],
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
        const { Patcher, DiscordModules, DiscordModules: { React } } = Library;
        const ChannelTextAreaButtons = BdApi.findModule(m => m.type && m.type.displayName === "ChannelTextAreaButtons")
        const ChannelTextAreaButton = BdApi.findModule(m => m.type?.displayName === "ChannelTextAreaButton");
        const TooltipContainer = BdApi.findModuleByProps('TooltipContainer').TooltipContainer;
        const MessageQueue = BdApi.findModuleByProps('enqueue');

        let shouldMention = BdApi.loadData(config.info.name, "shouldMention") || false;

        const enabledMention = [React.createElement("path", { fill: "currentcolor", d: "M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z" })]
        const disabledMention = [React.createElement("path", { fill: "currentcolor", d: "M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z" }), React.createElement("rect", { x: "-3.5", y: "12.5", width: "30", height: "3", fill: "red", transform: "matrix(0.707107, -0.707107, 0.707107, 0.707106, -5.975575, 9.4589)" })]

        class MentionButton extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    mention: shouldMention,
                };
            }

            toggleMention() {
                this.setState({ mention: !this.state.mention });
                shouldMention = this.state.mention;
                BdApi.saveData(config.info.name, "shouldMention", this.state.mention);
            }

            render() {
                const { mention } = this.state;
                return React.createElement(ChannelTextAreaButton, {
                    onClick: this.toggleMention.bind(this),
                },
                    React.createElement("div", { style: { minWidth: "35px" } },
                        React.createElement(TooltipContainer, {
                            text: mention ? "Enable mention" : "Disable mention"
                        },
                            React.createElement("svg",
                                { style: { width: "24px", height: "24px" }, viewBox: "0 -2 24 24" },
                                mention ? disabledMention : enabledMention))));
            }
        }
        return class AllowedMentions extends Plugin {
            onStart() {
                this.patchTextAreaButtons();
                this.patchMessageSend();
            }

            patchTextAreaButtons() {
                Patcher.after(ChannelTextAreaButtons, "type", (_, [props], ret) => {
                    ret.props.children.push(React.createElement(MentionButton, { className: "MentionButton" }));
                })
            }

            patchMessageSend() {
                Patcher.after(DiscordModules.MessageActions, "sendMessage", (_, [channelID, msg, , { messageReference }]) => {
                    if (shouldMention) return;
                    console.log("Sending with disabled mention");
                    MessageQueue.enqueue({
                        type: 0,
                        message: {
                            channelId: channelID,
                            content: msg.content,
                            tts: msg.tts,
                            message_reference: messageReference,
                            allowed_mentions: { "parse": [] }
                        }
                    }, r => {
                        return;
                    });
                    msg.content = "";
                })
            }

            onStop() {
                Patcher.unpatchAll();
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));