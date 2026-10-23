import type { Commands } from "@api";
import type { FriendInvite } from "@vencord/discord-types";
import type { ReactElement } from "react";

export type { FriendInvite };

export type Command = Parameters<typeof Commands.register>[0];

export interface InviteModule {
    createFriendInvite(): Promise<FriendInvite>;
    getAllFriendInvites(): Promise<FriendInvite[]>;
    revokeFriendInvites(): Promise<void>;
}

export interface TabBar {
    Panel(props: { id: string; children: ReactElement<any, any> }): ReactElement<{ children: ReactElement<any, any> }>;
}
