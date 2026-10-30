import { Webpack } from "@api";
import type { ModuleWithKey } from "@typings";
import type {
    ChannelStore as ChannelStoreType,
    GuildChannelStore as GuildChannelStoreType,
    SelectedGuildStore as SelectedGuildStoreType,
    UserStore as UserStoreType
} from "@vencord/discord-types";

import type { ChannelActions as ChannelActionsType, MessageStore as MessageStoreType } from "../types";

const { Filters } = Webpack;

interface ModuleTypes {
    ChannelActions?: ChannelActionsType;
    DMRow?: ModuleWithKey;
}

const Modules = Webpack.getBulkKeyed<ModuleTypes>({
    ChannelActions: {
        filter: Filters.byKeys("preload", "fetchChannel"),
        cacheId: "MessagePeek.ChannelActions"
    },
    DMRow: {
        filter: Filters.combine(
            Filters.byStrings("getRecipientId", "isMultiUserDM"),
            module => !String(module).includes("aria-posinset"),
            Filters.bySource('location:"PrivateChannel"')
        ),
        searchExports: true,
        withKey: true,
        cacheId: "MessagePeek.DMRow"
    }
});

export const { ChannelActions, DMRow } = Modules;

export const getGuildChannelRow = (signal: AbortSignal) =>
    Webpack.waitForModule<ModuleWithKey>(Filters.byStrings("connectDragPreview", "hasActiveThreads", "iconClassName"), {
        searchExports: true,
        withKey: true,
        cacheId: "MessagePeek.GuildChannelRow",
        signal
    });

export const ChannelStore = Webpack.getStore("ChannelStore") as unknown as ChannelStoreType;
export const GuildChannelStore = Webpack.getStore("GuildChannelStore") as unknown as GuildChannelStoreType;
export const MessageStore = Webpack.getStore("MessageStore") as unknown as MessageStoreType;
export const SelectedGuildStore = Webpack.getStore("SelectedGuildStore") as unknown as SelectedGuildStoreType;
export const UserStore = Webpack.getStore("UserStore") as unknown as UserStoreType;
