import { Commands, Webpack } from "@api";
import { InviteModule } from "../modules/shared";

const { Types: { OptionTypes } } = Commands;
const { createFriendInvite } = InviteModule;

const { sendMessage } = Webpack.getByKeys("sendMessage");

export default {
    id: "FC-Create",
    name: "create-friend-code",
    description: "Create a friend code",
    options: [
        {
            type: OptionTypes.BOOLEAN,
            name: "ephemeral",
            description: "Whether the message should be only visible to you or for everyone",
            required: false
        }
    ],
    execute: async (props, { channel }) => {
        const invite = await createFriendInvite();
        const msg = `
            Max Uses: ${invite.max_uses}
            Expires: <t:${new Date(invite.expires_at).getTime() / 1000}:R>
            https://discord.gg/${invite.code}
        `.replace(/^\s+/gm, "");
        if (props.find(o => o.name === "ephemeral")?.value ?? true)
            return { content: msg };
        else sendMessage(channel.id, { content: msg });
    }
}