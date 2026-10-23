import { Webpack } from "@api";

import type { InviteModule as InviteModuleType, TabBar as TabBarType } from "../types";

const { Filters } = Webpack;

interface ModuleTypes {
    InviteModule: InviteModuleType;
    TabBar?: TabBarType;
}

const Modules = Webpack.getBulkKeyed<ModuleTypes>({
    InviteModule: {
        filter: Filters.byKeys("createFriendInvite", "getAllFriendInvites", "revokeFriendInvites"),
        cacheId: "FriendCodes.InviteModule"
    },
    TabBar: {
        filter: Filters.byKeys("Header", "Item", "Separator", "Panel"),
        searchExports: true,
        cacheId: "FriendCodes.TabBar"
    }
});

export const { InviteModule, TabBar } = Modules;
