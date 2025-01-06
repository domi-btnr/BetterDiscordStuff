import { Webpack } from "@api";

export const DiscordComponents = Webpack.getByKeys("Button", "FormTitle");
export const Flex = Webpack.getByStrings(".HORIZONTAL", ".START");
export const InviteModule = Webpack.getByKeys("createFriendInvite");