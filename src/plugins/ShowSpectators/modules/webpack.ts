import { Webpack } from "@api";
import type { ModuleWithKey } from "@typings";
import type {
    ApplicationStreamingStore as ApplicationStreamingStoreType,
    ChannelRTCStore as ChannelRTCStoreType,
    SelectedChannelStore as SelectedChannelStoreType,
    UserStore as UserStoreType,
    WindowStore as WindowStoreType
} from "@vencord/discord-types";

import type {
    AvatarComponent,
    AvatarStyles as AvatarStylesType,
    ClickableComponent,
    NameUtils as NameUtilsType,
    UserPopoutComponent,
    UserProfileActions as UserProfileActionsType,
    UserSummaryItemComponent
} from "../types";

const { Filters } = Webpack;

interface ModuleTypes {
    AccountPanelSections?: ModuleWithKey;
    Avatar: AvatarComponent;
    AvatarStyles: AvatarStylesType;
    Clickable: ClickableComponent;
    NameUtils?: NameUtilsType;
    StreamIcon?: ModuleWithKey;
    UserPopout?: UserPopoutComponent;
    UserProfileActions?: UserProfileActionsType;
    UserSummaryItem: UserSummaryItemComponent;
}

const Modules = Webpack.getBulkKeyed<ModuleTypes>({
    AccountPanelSections: {
        filter: Filters.combine(
            Filters.byStrings(".Provider,{value:"),
            Filters.bySource("createContext([])", "newestAnalyticsLocation:")
        ),
        searchExports: true,
        withKey: true,
        cacheId: "ShowSpectators.AccountPanelSections"
    },
    Avatar: {
        filter: Filters.byStrings("typingIndicatorRef", "statusTooltipDelay", "statusBackdropColor"),
        searchExports: true,
        cacheId: "ShowSpectators.Avatar"
    },
    AvatarStyles: {
        filter: Filters.byKeys("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar"),
        cacheId: "ShowSpectators.AvatarStyles"
    },
    Clickable: {
        filter: Filters.byStrings("this.context?this.renderNonInteractive():"),
        searchExports: true,
        cacheId: "ShowSpectators.Clickable"
    },
    NameUtils: {
        filter: Filters.byKeys("getName", "getNickname", "useName"),
        cacheId: "ShowSpectators.NameUtils"
    },
    StreamIcon: {
        filter: Filters.byStrings(".STATUS_SCREENSHARE"),
        withKey: true,
        cacheId: "ShowSpectators.StreamIcon"
    },
    UserPopout: {
        filter: Filters.combine(
            m => m?.$$typeof === Symbol.for("react.memo"),
            Filters.bySource('type:"popout",withMutualGuilds', "disableUserProfileLink")
        ),
        searchExports: true,
        cacheId: "ShowSpectators.UserPopout"
    },
    UserProfileActions: {
        filter: Filters.byKeys("openUserProfileModal"),
        cacheId: "ShowSpectators.UserProfileActions"
    },
    UserSummaryItem: {
        filter: Filters.byStrings("defaultRenderUser", "showDefaultAvatarsForNullUsers"),
        cacheId: "ShowSpectators.UserSummaryItem"
    }
});

export const {
    AccountPanelSections,
    Avatar,
    AvatarStyles,
    Clickable,
    NameUtils,
    StreamIcon,
    UserPopout,
    UserProfileActions,
    UserSummaryItem
} = Modules;

export const ApplicationStreamingStore = Webpack.getStore(
    "ApplicationStreamingStore"
) as unknown as ApplicationStreamingStoreType;
export const ChannelRTCStore = Webpack.getStore("ChannelRTCStore") as unknown as ChannelRTCStoreType;
export const SelectedChannelStore = Webpack.getStore("SelectedChannelStore") as unknown as SelectedChannelStoreType;
export const UserStore = Webpack.getStore("UserStore") as unknown as UserStoreType;
export const WindowStore = Webpack.getStore("WindowStore") as unknown as WindowStoreType;
