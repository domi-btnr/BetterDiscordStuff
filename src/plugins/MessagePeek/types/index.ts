import type { ChannelMessages, Message, MessageStore as MessageStoreType } from "@vencord/discord-types";

export type AttachmentKind = "image" | "gif" | "video" | "audio" | "file";

export interface ChannelActions {
    preload(guildId: string, channelId: string): void;
}

export type ChannelClasses = Record<"channel" | "decorator", string>;

export type Location = "dm" | "guild";

export type MessageStore = Omit<MessageStoreType, "getMessages"> & {
    getMessages(channelId: string): (ChannelMessages & { last(): Message | undefined }) | undefined;
};

export interface WrapperProps {
    __original: (props: object) => any;
    __patch(res: any): void;
    [key: string]: any;
}
