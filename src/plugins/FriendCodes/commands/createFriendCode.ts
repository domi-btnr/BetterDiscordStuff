import { Commands, Logger } from "@api";
import { MessageActions } from "@common/Webpack";

import { t } from "../modules/i18n";
import { InviteModule } from "../modules/webpack";
import type { Command } from "../types";

const {
    Types: { OptionTypes }
} = Commands;

export default function createFriendCode(): Command {
    return {
        id: "FC-Create",
        name: "create-friend-code",
        description: t("commands.create.description"),
        options: [
            {
                type: OptionTypes.BOOLEAN,
                name: "ephemeral",
                description: t("commands.create.ephemeral"),
                required: false
            }
        ],
        execute: async (options, { channel }) => {
            try {
                const invite = await InviteModule.createFriendInvite();
                const msg = t("commands.create.message", {
                    maxUses: invite.max_uses,
                    expires: `<t:${new Date(invite.expires_at!).getTime() / 1000}:R>`,
                    link: `https://discord.gg/${invite.code}`
                });
                if (options.find(o => o.name === "ephemeral")?.value ?? true) return { content: msg };
                MessageActions.sendMessage(channel.id, { content: msg }, undefined, { location: "chat_input" });
            } catch (err) {
                Logger.error("Failed to create a Friend Code", err);
                return { content: t("errors.create") };
            }
        }
    };
}
