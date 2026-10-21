import { Dispatcher, Flux } from "@common/Webpack";

let invites = [];
let loaded = false;

const FriendInvitesStore = new (class FriendInvitesStore extends Flux.Store {
    constructor() {
        super(Dispatcher, {
            FRIEND_INVITES_FETCH_RESPONSE: ({ invites: fetched }) => {
                invites = fetched;
                loaded = true;
            },
            FRIEND_INVITE_CREATE_SUCCESS: ({ invite }) => {
                invites = [...invites, invite];
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
})();

export default FriendInvitesStore;
