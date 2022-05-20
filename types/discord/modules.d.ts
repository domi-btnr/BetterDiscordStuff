declare module "@discord/modules" {
    export const Dispatcher: {
        dispatch: (event: any | { type: string }) => void;
        subscribe<T>(event: string, listener: (data: T | { type: string }) => void): void;
        unsubscribe(event: string, listener: any): void;
        dirtyDispatch: ({type: string}) => void;
        wait: (func: () => void) => void;
    };
    export const EmojiUtils: {
        uploadEmoji: (guildId: string, emojiDataURI: string, name: string) => Promise<void>;
    };
    export const PermissionUtils: {
        can: (permission: bigint, user: UserObject, guild: GuildObject | ChannelObject) => boolean;
    }
}