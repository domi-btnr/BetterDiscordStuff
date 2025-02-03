import { Components, Patcher, UI, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";

export default class BetterInvites {
    start() {
        showChangelog(manifest);
        this.patchInvite();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchInvite() {
        const [Invite, Key] = Webpack.getWithKey(Webpack.Filters.byStrings("invite", "author", "guild", ".premium_subscription_count"));
        const Styles = Webpack.getByKeys("markup");

        Patcher.after(Invite, Key, (_, [props], res) => {
            const guild = res.props.children[0].props.guild;
            const inviter = props.invite.inviter;

            let expireTooltip;
            if (Settings.get("showInviteExpiry", true) && props.invite.expires_at) {
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
                Settings.get("showBoostLevel", true) ||
                Settings.get("showInviter", true) ||
                Settings.get("showVerificationLevel", true) ||
                Settings.get("showNSFW", true) ||
                Settings.get("showInviteExpiry", true)
            ) {
                res.props.children[2].props.children.splice(1, 0,
                    <div className={`${manifest.name}-iconWrapper`} style={{ display: "grid", grid: "auto / auto auto", direction: "rtl", "grid-gap": "3px" }}>
                        {Settings.get("showBoostLevel", true) && guild.premiumTier > 0 && (
                            <Components.Tooltip text={`Boost Level ${guild.premiumTier}`}>
                                {props => <img {...props} style={{ height: "28px", borderRadius: "5px", objectFit: "contain" }} src="https://discord.com/assets/4a2618502278029ce88adeea179ed435.svg" />}
                            </Components.Tooltip>
                        )}
                        {Settings.get("showInviter", true) && inviter && (
                            <Components.Tooltip text={`Invited by ${inviter.username}`}>
                                {props => (
                                    <img
                                        {...props}
                                        style={{ height: "28px", borderRadius: "5px", objectFit: "contain" }}
                                        src={`https://cdn.discordapp.com/avatars/${inviter?.id}/${inviter?.avatar}.png?size=1024`}
                                        onError={e => { e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"; }}
                                        onClick={() => {
                                            DiscordNative.clipboard.copy(inviter.id);
                                            UI.showToast("Copied ID", { type: "info", icon: true, timeout: 4000 });
                                        }}
                                    />
                                )}
                            </Components.Tooltip>
                        )}
                        {Settings.get("showVerificationLevel", true) && guild.verificationLevel > 0 && (
                            <Components.Tooltip text={`Verification Level ${guild.verificationLevel}`}>
                                {props => <img {...props} style={{ height: "28px", borderRadius: "5px", objectFit: "contain" }} src="https://discord.com/assets/e62b930d873735bbede7ae1785d13233.svg" />}
                            </Components.Tooltip>
                        )}
                        {Settings.get("showNSFW", true) && guild.nsfw_level && (
                            <Components.Tooltip text="NSFW">
                                {props => <img {...props} style={{ height: "28px", borderRadius: "5px", objectFit: "contain" }} src="https://discord.com/assets/ece853d6c1c1cd81f762db6c26fade40.svg" />}
                            </Components.Tooltip>
                        )}
                        {Settings.get("showInviteExpiry", true) && props.invite.expires_at && (
                            <Components.Tooltip text={`Invite expires in ${expireTooltip}`}>
                                {props => <img {...props} style={{ height: "28px", borderRadius: "5px", objectFit: "contain" }} src="https://discord.com/assets/7a844e444413cf4c3c46.svg" />}
                            </Components.Tooltip>
                        )}
                    </div>
                );
                // Move Join Button in next Row
                res.props.children[2].props.children[0].props.style = { "width": "325px" };
            }

            if (Settings.get("showGuildDescription", true) && guild.description) {
                const index = res.props.children[2].props.children.findIndex(e => e.type.displayName === "InviteButton.Button");
                res.props.children[2].props.children.splice(index, 0,
                    <div className={`${manifest.name}-guildDescription`} style={{ marginTop: "-14px", width: "100%" }}>
                        <div className={Styles.markup}>{guild.description}</div>
                    </div>
                );
            }

            if (Settings.get("bannerType", "BetterInvites") === "BetterInvites" && guild.banner) {
                if (guild.features.has("INVITE_SPLASH")) res.props.children.splice(0, 1);
                res.props.children.splice(1, 0,
                    <div className={`${manifest.name}-banner`} style={{ position: "relative", borderRadius: "4px", height: "92px", margin: "-6px 0 8px 0", overflow: "hidden" }}>
                        <img
                            style={{
                                display: "block",
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                            src={`https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.gif?size=1024`}
                            onError={e => {
                                e.target.onError = null;
                                e.target.src = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024`;
                            }}
                        />
                    </div>
                );
            }
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
