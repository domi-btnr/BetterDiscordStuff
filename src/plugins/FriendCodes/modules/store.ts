import { Logger } from "@api";
import { Dispatcher, Flux } from "@common/Webpack";

import type { FriendInvite } from "../types";
import { InviteModule } from "./webpack";

let invites: FriendInvite[] = [];
let loaded = false;
let failed = false;

const uniqueByCode = (list: FriendInvite[]) => [...new Map(list.map(invite => [invite.code, invite])).values()];

const FriendInvitesStore = new (class FriendInvitesStore extends Flux.Store {
    constructor() {
        super(Dispatcher, {
            FRIEND_INVITES_FETCH_RESPONSE: ({ invites: fetched }: { invites: FriendInvite[] }) => {
                invites = uniqueByCode(fetched);
                loaded = true;
                failed = false;
            },
            FRIEND_INVITE_CREATE_SUCCESS: ({ invite }: { invite: FriendInvite }) => {
                invites = uniqueByCode([...invites, invite]);
            },
            FRIEND_INVITE_REVOKE_SUCCESS: () => {
                invites = [];
            }
        });
    }

    getInvites() {
        return invites;
    }

    hasLoaded() {
        return loaded;
    }

    hasFailed() {
        return failed;
    }
})();

export function fetchInvites() {
    failed = false;
    FriendInvitesStore.emitChange();

    return InviteModule.getAllFriendInvites().catch(err => {
        Logger.error("Failed to fetch Friend Codes", err);
        failed = true;
        FriendInvitesStore.emitChange();
    });
}

export default FriendInvitesStore;
