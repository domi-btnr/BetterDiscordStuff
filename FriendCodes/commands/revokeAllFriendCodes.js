import { InviteModule } from "../modules/shared";

const { getAllFriendInvites, revokeFriendInvites } = InviteModule;

export default {
    id: "FC-RevokeAll",
    name: "revoke-all-friend-codes",
    description: "Revoke all Friend Codes",
    execute: async () => {
        const invites = await getAllFriendInvites();
        await revokeFriendInvites();
        return { content: `Revoked ${invites.length} Friend Code${invites.length == 1 ? "" : "s"}` };
    }
};
