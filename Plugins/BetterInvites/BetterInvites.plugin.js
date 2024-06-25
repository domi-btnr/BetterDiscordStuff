/**
 * @name BetterInvites
 * @author domi.btnr
 * @authorId 354191516979429376
 * @version 1.6.5
 * @description Shows some useful information in the invitation
 * @invite gp2ExK5vc7
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/main/Plugins/BetterInvites
 * @donate https://paypal.me/domibtnr
 */

const PLUGIN_NAME = "BetterInvites";

const BD = new BdApi(PLUGIN_NAME);
const { Components, Data, Patcher, React, Webpack, Webpack: { Filters } } = BD;

const BANNER_TYPES = [PLUGIN_NAME, "Discord Invite Splash"]
const DEFAULTS = {
    BANNER_TYPE: BANNER_TYPES[0].replaceAll(" ", ""),
    showGuildDescription: true,
    showBoostLevel: true,
    showInviter: true,
    showVerificationLevel: true,
    showNSFW: true,
    showInviteExpiry: true
};
const SETTINGS = Object.assign({}, DEFAULTS, BD.Data.load("SETTINGS"));

const DiscordNative = Webpack.getByKeys("DiscordNative").DiscordNative;
const Monolith = Webpack.getByKeys("FormSwitch");

module.exports = _ => ({
    patchInvite() {
        const [Invite, Key] = Webpack.getWithKey(Filters.byStrings("invite", "author", "guild", ".premium_subscription_count"));
        const Styles = Webpack.getByKeys("markup");

        Patcher.after(Invite, Key, (_, [props], res) => {
            const guild = res.props.children[0].props.guild;
            const inviter = props.invite.inviter;

            let expireTooltip;
            if (SETTINGS.showInviteExpiry && props.invite.expires_at) {
                const expiresAt = new Date(props.invite.expires_at);
                const expiresIn = expiresAt - Date.now();

                const days = Math.floor(expiresIn / 1000 / 60 / 60 / 24);
                const hours = Math.floor(expiresIn / 1000 / 60 / 60);
                const minutes = Math.floor(expiresIn / 1000 / 60);

                if (days > 0) expireTooltip = `${days} day${days !== 1 ? "s" : ""}`;
                else if (hours > 0) expireTooltip = `${hours} hour${hours !== 1 ? "s" : ""}`;
                else expireTooltip = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
            }

            if (
                SETTINGS.showBoostLevel ||
                SETTINGS.showInviter ||
                SETTINGS.showVerificationLevel ||
                SETTINGS.showNSFW ||
                SETTINGS.showInviteExpiry
            ) {
                res.props.children[2].props.children.splice(1, 0,
                    React.createElement("div", { className: `${PLUGIN_NAME}-iconWrapper`, style: { display: "grid", grid: "auto / auto auto", direction: "rtl", "grid-gap": "3px" } },
                        SETTINGS.showBoostLevel && guild.premiumTier > 0 && React.createElement(Components.Tooltip, { text: `Boost Level ${guild.premiumTier}` },
                            props => React.createElement("img", { ...props, style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/4a2618502278029ce88adeea179ed435.svg" })
                        ),
                        SETTINGS.showInviter && inviter && React.createElement(Components.Tooltip, { text: `Invited by ${inviter.username}` },
                            props => React.createElement("img", {
                                ...props,
                                style: { height: "28px", borderRadius: "5px", objectFit: "contain" },
                                src: `https://cdn.discordapp.com/avatars/${inviter?.id}/${inviter?.avatar}.png?size=1024`,
                                onError: e => { e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"; },
                                onClick: () => { DiscordNative.clipboard.copy(inviter.id); BD.showToast("Copied ID", { type: "info", icon: true, timeout: 4000 }) }
                            })
                        ),
                        SETTINGS.showVerificationLevel && guild.verificationLevel > 0 && React.createElement(Components.Tooltip, { text: `Verification Level ${guild.verificationLevel}` },
                            props => React.createElement("img", { ...props, style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/e62b930d873735bbede7ae1785d13233.svg" })
                        ),
                        SETTINGS.showNSFW && guild.nsfw_level && React.createElement(Components.Tooltip, { text: "NSFW" },
                            props => React.createElement("img", { ...props, style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/ece853d6c1c1cd81f762db6c26fade40.svg" })
                        ),
                        SETTINGS.showInviteExpiry && props.invite.expires_at && React.createElement(Components.Tooltip, { text: `Invite expires in ${expireTooltip}` },
                            props => React.createElement("img", { ...props, style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/7a844e444413cf4c3c46.svg" })
                        )
                    )
                );
                // Move Join Button in next Row
                res.props.children[2].props.children[0].props.style = { "width": "325px" };
            }

            if (SETTINGS.showGuildDescription && guild.description) {
                const index = res.props.children[2].props.children.findIndex(e => e.type.displayName === "InviteButton.Button");
                res.props.children[2].props.children.splice(index, 0,
                    React.createElement("div", { className: `${PLUGIN_NAME}-guildDescription`, style: { marginTop: "-14px", width: "100%" } },
                        React.createElement("div", { className: Styles.markup }, guild.description)
                    )
                );
            }

            if (SETTINGS.BANNER_TYPE === BANNER_TYPES[0].replaceAll(" ", "") && guild.banner) {
                if (guild.features.has("INVITE_SPLASH")) res.props.children.splice(0, 1);
                res.props.children.splice(1, 0,
                    React.createElement("div", {
                        className: `${PLUGIN_NAME}-banner`,
                        style: { position: "relative", borderRadius: "4px", height: "92px", margin: "-6px 0 8px 0", overflow: "hidden" }
                    },
                        React.createElement("img", {
                            style: { display: "block", width: "100%", height: "100%", objectFit: "cover" },
                            src: `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.gif?size=1024`,
                            onError: (e) => { e.target.onError = null, e.target.src = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024` }
                        })
                    )
                );

            }
        });
    },
    start() {
        this.patchInvite();
    },
    stop() {
        BD.Patcher.unpatchAll();
    },
    getSettingsPanel() {
        const { FormDivider, FormSwitch, FormTitle, Select } = Monolith;

        return React.createElement("div", null,
            React.createElement(FormTitle, { tag: "h3" }, "Banner Type"),
            React.createElement(Select, {
                placeholder: "Banner Type",
                options: BANNER_TYPES.map(e => ({ label: e, value: e.replaceAll(" ", "") })),
                closeOnSelect: true,
                select: v => {
                    SETTINGS.BANNER_TYPE = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                isSelected: v => SETTINGS.BANNER_TYPE === v,
                serialize: v => String(v)
            }),
            React.createElement(FormDivider, { style: { marginTop: "20px" } }),
            React.createElement(FormSwitch, {
                value: SETTINGS.showGuildDescription,
                note: "Shows the description from Server Discovery",
                onChange: v => {
                    SETTINGS.showGuildDescription = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                style: { margin: "8px 0" }
            }, "Show Guild Description"),
            React.createElement(FormSwitch, {
                value: SETTINGS.showBoostLevel,
                note: "Shows the Boost Level of the Server",
                onChange: v => {
                    SETTINGS.showBoostLevel = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                style: { margin: "8px 0" }
            }, "Show Boost Level"),
            React.createElement(FormSwitch, {
                value: SETTINGS.showInviter,
                note: "Shows the Inviter of the User",
                onChange: v => {
                    SETTINGS.showInviter = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                style: { margin: "8px 0" }
            }, "Show Inviter"),
            React.createElement(FormSwitch, {
                value: SETTINGS.showVerificationLevel,
                note: "Shows the Verification Level of the Server",
                onChange: v => {
                    SETTINGS.showVerificationLevel = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                style: { margin: "8px 0" }
            }, "Show Verification Level"),
            React.createElement(FormSwitch, {
                value: SETTINGS.showNSFW,
                note: "Shows if the Server is NSFW",
                onChange: v => {
                    SETTINGS.showNSFW = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                style: { margin: "8px 0" }
            }, "Show NSFW"),
            React.createElement(FormSwitch, {
                value: SETTINGS.showInviteExpiry,
                note: "Shows the Expiry Date of the Invite",
                onChange: v => {
                    SETTINGS.showInviteExpiry = v;
                    Data.save("SETTINGS", SETTINGS);
                },
                style: { margin: "8px 0" }
            }, "Show Invite Expiry")
        );
    }
});