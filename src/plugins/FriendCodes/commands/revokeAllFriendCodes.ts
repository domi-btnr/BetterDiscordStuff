import { Logger } from "@api";

import { t } from "../modules/i18n";
import { InviteModule } from "../modules/webpack";
import type { Command } from "../types";

export default function revokeAllFriendCodes(): Command {
    return {
        id: "FC-RevokeAll",
        name: "revoke-all-friend-codes",
        description: t("commands.revoke.description"),
        execute: async () => {
            try {
                const invites = await InviteModule.getAllFriendInvites();
                await InviteModule.revokeFriendInvites();
                return { content: t("commands.revoke.revoked", { count: invites.length }) };
            } catch (err) {
                Logger.error("Failed to revoke your Friend Codes", err);
                return { content: t("errors.revoke") };
            }
        }
    };
}
