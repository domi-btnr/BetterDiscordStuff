/**
 * @name BetterInvites
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.0
 * @description Shows some useful information in the invitation
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/BetterInvites
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/BetterInvites/BetterInvites.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "BetterInvites",
        authors: [
            {
                name: "HypedDomi",
                discord_id: "354191516979429376",
            },
        ],
        version: "1.0.1",
        description:
            "Shows some useful information in the invitation",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/BetterInvites",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/BetterInvites/BetterInvites.plugin.js",
    },
    changelog: [
        {
            title: "Fixed",
            type: "fixed",
            items: ["Fixed Typo in NSFW"],
        },
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
        const { React } = DiscordModules;
        const Invite = BdApi.findModule(m => m.default?.displayName === "GuildInvite");
        const TooltipContainer = BdApi.findModuleByProps('TooltipContainer').TooltipContainer;
        class BetterInvites extends Plugin {
            onStart() {
                this.patchInvite();
            }

            patchInvite() {
                Patcher.after(Invite, "default", (_, [props], component) => {
                    const { invite } = props;
                    if (!invite) return;
                    const { guild, inviter } = invite;

                    let boostLevel = 0;
                    if (guild.features.includes("VANITY_URL")) boostLevel = 3;
                    else if (guild.features.includes("BANNER")) boostLevel = 2;
                    else if (guild.features.includes("ANIMATED_ICON")) boostLevel = 1;

                    if (guild?.banner) {
                        component.props.children.splice(1, 0,
                            React.createElement("div", { className: `${config.info.name}-guildBanner`, style: { position: "relative", marginBottom: "1%" } },
                                React.createElement("img", {
                                    src: `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024`,
                                    style: { width: "100%", height: "auto", maxHeight: "100px", borderRadius: "5px", objectFit: "cover" }
                                })
                            )
                        )
                    }
                    component.props.children[guild?.banner ? 2 : 1].props.children.splice(2, 0,
                        React.createElement("div", { className: `${config.info.name}-iconWrapper`, style: { display: "grid", grid: "auto / auto auto", direction: "rtl", "grid-gap": "3px" } },
                            // Boost
                            boostLevel > 0 ?
                                React.createElement(TooltipContainer, { text: `Boost Level ${boostLevel}` },
                                    React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/4a2618502278029ce88adeea179ed435.svg" }))
                                : null,
                            // Inviter
                            inviter ?
                                React.createElement(TooltipContainer, { text: `Invited by: ${inviter?.username}#${inviter?.discriminator}` },
                                    React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: `https://cdn.discordapp.com/avatars/${inviter?.id}/${inviter?.avatar}.png?size=1024`, onError: (e) => { e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"; } }))
                                : null,
                            // Verification
                            guild?.verification_level > 0 ?
                                React.createElement(TooltipContainer, { text: `Verification Level ${guild?.verification_level}` },
                                    React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/e62b930d873735bbede7ae1785d13233.svg" }))
                                : null,
                            // NSFW
                            guild?.nsfw_level > 0 ?
                                React.createElement(TooltipContainer, { text: `NSFW Level ${guild?.nsfw_level}` },
                                    React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/ece853d6c1c1cd81f762db6c26fade40.svg" }))
                                : null,
                        )
                    );
                });
            }

            onStop() {
                Patcher.unpatchAll();
            }
        }
        return BetterInvites;
    })(global.ZeresPluginLibrary.buildPlugin(config));
