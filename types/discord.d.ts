type ReactElement = any;

declare interface UserObject {
    id: string;
    banner: string | null;
    avatarUrl: string;
    getAvatarURL: (showServerAvatar?: boolean, animate?: boolean) => string;
    createdAt: Date;
    bannerURL: string;
    bot: boolean;
    discriminator: string;
    bio: string;
    bannerColor: null | string;
    avatar: string;
    system: boolean;
    username: string;
}

declare interface GuildObject {
    id: string;
    icon: string;
    name: string;
    description: string;
    ownerId: string;
    getIconURL: (type: "gif" | "webp" | "png") => string;
}

declare interface ChannelObject {
    id: string;
    icon: string;
    name: string;
    description: string;
    guild_id: string;
    ownerId: string | null;

    type: number;
}

declare module "@discord" {
    export * as utils from "@discord/utils";
    export * as components from "@discord/utils";
    export * as modules from "@discord/modules";
    export * as stores from "@discord/stores";
}

declare module "@discord/utils" {
    export function joinClassNames(...args: string[] | object[]): string;
    export function useForceUpdate(): React.DispatchWithoutAction;
    export class Logger {
        constructor(module: string)

        log(...message): void;
        error(...message): void;
        info(...message): void;
        verbose(...message): void;
        trace(...message): void;
        warn(...message): void;
    }

    export const Navigation: {
        replaceWith: (path: string) => void
    };
}

declare module "@discord/i18n" {
    type locale = { name: string, englishName: string, code: string, postgresLang: string, enabled: boolean };
    export const languages: locale[];
    export const Messages: any;
    export const choosenLocale: string;
    export function getDefaultLocale(): string;
    export function getLocaleInfo(): locale;
    export function getLanguages(): locale[];
    export function getLocale(): string;
    export const loadPromise: Promise<void>;
    export function setLocale(locale: string): void;
    export const translationSiteURL: string;
    export const _proxyContext: {
        messages: any;
        locale: string;
        defaultMessages: any;
    };

    const Strings: {
        languages,
        Messages,
        choosenLocale,
        getDefaultLocale,
        getLocaleInfo,
        getLanguages,
        getLocale,
        loadPromise
        setLocale
        translationSiteURL
        _proxyContext
    };

    export default Strings;
}

declare module "@discord/stores" {
    export const Users: {
        getUser: (id: string) => UserObject;
        getUsers: () => UserObject[];
        getCurrentUser: () => UserObject;
    };

    export const SettingsStore: {
        status: "dnd" | "idle" | "online" | "offline";
        theme: "light" | "dark",
        showCurrentGame: boolean;
    }

    export const Messages: {
        getMessage: (channelId: string, messageId: string) => {
            id: string;
            channel_id: string;
            content: string;
            mentions: string[];
            author: UserObject
        } | null;
        getMessages: (channelId: string) => any;
    };
    export const Channels: {
        getChannel: (channelId: string) => ChannelObject;
    };
    export const Guilds: {
        getGuild: (guildId: string) => GuildObject | null;
        getGuilds: () => GuildObject[];
    };
    export const SelectedGuilds: {
        getGuildId: () => string;
    };
    export const SelectedChannels: {
        getChannelId: () => string;
    }
    export const Info: {
        getSessionId: () => string;
        getCurrentUser: () => UserObject;
    };
    export const Status: {
        getStatus(userId: string): void | "online" | "dnd" | "idle";
        getState(): { clientStatuses: any };
        isMobileOnline: (userId: string) => string;
    };
    export type UserProfileConnection = {
        type: string;
        id: string;
        name: string;
        verified: boolean;

    };
    export const UserProfile: {
        getUserProfile(userId: string): undefined | {
            connectedAccounts: UserProfileConnection[]
        };
        isFetching: (userId: string) => boolean;
    };

    export const Members: {
        getMember: (guildId: string, userId: string) => any;
    };

    export const Activities: {
        getActivities: (userId: string) => Array<any>;
    };

    export const Games: {
        getGame: (application_id: string) => null | {
            getIconURL: () => string;
            name: string;
            id: string;
        }
    };

    /**
     * Be careful
     */
    export const Auth: {
        getId: () => string;
    };

    export const TypingUsers: {
        isTyping: (channelId: string, userId: string) => boolean;
    };
}

declare module "@discord/connections" {
    export type Connection = {
        color: string;
        enabled: boolean;
        getPlatformUserUrl: (user: Connection) => void;
        icon: {
            color: string;
            grey: string;
            svg: string;
            white: string;
        };
        name: string;
        type: string;
    };

    export function get(type: string): Error | Connection;
    export function map<T>(callbackFn: (connection: Connection, currentIndex: number, target: Array<T>) => any);
    export function isSupported(type: string): boolean;
    export function filter<T>(callbackFn: (connection: Connection, currentIndex: number, target: Array<T>) => boolean);

    const Connections: {
        get,
        map,
        isSupported,
        filter
    };

    export default Connections;
}

declare module "@discord/actions" {
    export const ProfileActions: {
        fetchProfile: (userId: string) => Promise<any>;
    };
    export const GuildActions: {
        requestMembersById: (guildId: string, memberId: string) => void;
        transitionToGuildSync: (guildId: string, channelId?: string, messageId?: string) => void;
    };
}

declare module "@discord/contextmenu" {
    export function openContextMenu(event: MouseEvent, menu: () => ReactElement, options?: object): void;
    export function closeContextMenu(): void;
    export function MenuItem({ label, action, id }: { label: string, action: () => any, id: string }): ReactElement;
    export function MenuGroup({ children }: { children: any }): ReactElement;
    export function Menu({ children, navId, onClose }: { children: any, navId: string, onClose: Function }): ReactElement;
}

declare module "@discord/forms" {
    export function FormDivider({ className }: { className?: string }): any;
    export function FormItem(props: any): any;
    export function FormNotice(): any;
    export const FormNoticeTypes: { PRIMARY: string, DANGER: string, WARNING: string, SUCCESS: string, BRAND: string, CUSTOM: string };
    export const FormNoticeImagePositions: { LEFT: string, RIGHT: string };
    export function FormSection(): any;
    export function FormText({ type, children }: { type?: "description", children: any }): any;
    export const FormTextTypes: { DEFAULT: string, INPUT_PLACEHOLDER: string, DESCRIPTION: string, LABEL_BOLD: string, LABEL_SELECTED: string, LABEL_DESCRIPTOR: string };
    export function FormTitle(props: any): any;
    export const FormTitleTags: { H1: string, H2: string, H3: string, H4: string, H5: string, LABEL: string }
}

declare module "@discord/scrollbars" {
    export function ScrollerAuto(options: { className: string, children: any }): any;
    export function ScrollerThin(options: { className: string, children: any }): any;
    export default function Scroller(options: { className: string, children: any }): any;
}

declare module "@discord/native" {
    export function copy(text: string): void;
}

declare module "@discord/flux" {
    export class Store {
        _initialized: boolean;
        constructor(dispatcher: any, events: any)

        emitChange(): void;
        addChangeListener(): void;
        removeChangeListener(): boolean;
        waitFor(...stores: Store[]): void;
    }

    export function useStateFromStores(stores: Array<Store> | any[], collector: () => any, dependencies?: any[], isEqual?: (previousState: any, partialState: any) => boolean): any;
    export function useStateFromStoresArray(stores: Array<Store> | any[], collector: () => any, idk?: null, isEqual?: (previousState: any, partialState: any) => boolean): any;
    export function connectStores(stores: Array<Store>, collector: (props: any) => any): (props: any) => ReactElement;
}

declare module "@discord/modal" {
    export const ModalSize: { SMALL: "small", MEDIUM: "medium", LARGE: "large", DYNAMIC: "dynamic" };

    type ModalProps = { transitionState: 2 | 3, onClose: () => void };
    export function openModal(component: (props: ModalProps) => ReactElement, options?: {modalKey: string}): string;

    export function closeModal(modalKey: string): void;

    interface ModalRootProps {
        children?: ReactElement
    }
    export function ModalRoot(props: ModalRootProps): ReactElement;

    type ModalFooterProps = { children?: ReactElement, className?: string }
    export function ModalFooter(props: ModalFooterProps): ReactElement;

    type ModalHeaderProps = { children: ReactElement, className?: string };
    export function ModalHeader(props?: ModalHeaderProps): ReactElement;

    type ModalCloseButtonProps = { children?: ReactElement; focusProps?: any, onClick: (event: React.MouseEvent) => void, className?: string, hideOnFullscreen?: boolean };
    export function ModalCloseButton(props: ModalCloseButtonProps): ReactElement;

    type ModalContentProps = { children?: ReactElement, className?: string, scrollerRef?: (element: Element) => void };
    export function ModalContent(props: ModalContentProps): ReactElement;
}

declare module "@discord/sanitize" {
    export function decode(e, t?: any, n?: any, o?: any): any;
    export function encode(e, t?: any, n?: any, s?: any): any;
    export function parse(e, t?: any, n?: any, o?: any): any;
    export function stringify(e, t?: any, n?: any, s?: any): any;
}