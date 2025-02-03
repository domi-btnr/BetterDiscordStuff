import { Webpack } from "@api";

export const DiscordComponents = Webpack.getMangled(/ConfirmModal:\(\)=>.{1,3}.ConfirmModal/, {
    FormTitle: x => x.toString?.().includes("[\"defaultMargin\".concat", "=\"h5\""),
});
export const InviteModule = Webpack.getByKeys("createFriendInvite");
