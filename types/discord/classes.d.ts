declare class Message {
    author: UserObject;
    content: string;
    id: string;
    timestamp: Date;
}

declare class User {
    get banner(): string | null;
    getAvatarURL(): string | null;
    id: string;
    avatar: string;
    username: string;
    discriminator: string;
}

declare class Channel {
    application_id: void | string;
    bitrate: number;
    defaultAutoArchiveDuration: void | number;
    guild_id: void | string;
    lastMessageId: void | string;
    lastPinTimestamp: string;
    nsfw: boolean;
    permissions: BigInt;
    name: string;
    id: string;
    icon: void | string;
    description: string;
    type: number;
    getRecipientId(): void | string
}

declare class Timestamp {
    constructor(timestamp: any)

    toDate(): Date;
    month: number;
}

declare const GuildRole: {
    color: number;
    colorString: string;
    hoist: boolean;
    icon: void | string;
    id: string;
    managed: boolean;
    mentionable: boolean;
    name: string;
    originalPosition: number;
    permissions: BigInt;
    position: number;
    tags: void | any;
    unicodeEmoji: void | any;
};

declare class Guild {
    afkChannelId: void | string;
    afkTimeout: number;
    applicationCommandCounts: {[pos: string]: number};
    application_id: void | string;
    banner: void | string;
    defaultMessageNotifications: number;
    description: void | string;
    discoverySplash: void | string;
    explicitContentFilter: number;
    features: Set<string>;
    icon: null | string;
    id: string;
    joinedAt: Date;
    maxMembers: number;
    maxVideoChannelUsers: number;
    mfaLevel: number;
    name: string;
    ownerId: string;
    preferredLocale: string;
    premiumSubscriberCount: number;
    premiumTier: 1 | 2 | 3;
    publicUpdateChannelId: void | string;
    roles: {[roleId: string]: typeof GuildRole}
    rulesChannelId: void | string;
    splash: string;
    systemChannelFlags: number;
    systemChannelId: void | string;
    vanityURLCode: void | string;
    verificationLevel: 1 | 2 | 3 | 4 | 5;
    get acronym(): string;
    getApplicationId(): string;
    getIconSource(size: number, animated?: boolean): string;
    getIconURL(size: number, animated?: boolean): string;
    getMaxEmojiSlots(): number;
    getRole(id: string): void | typeof GuildRole;
    hasFeature(feature: keyof typeof import("@discord/constants").GuildFeatures): boolean;
    isLurker(): boolean;
    isNew(arg: number): boolean;
    isOwner(userOrId: string | typeof User): boolean;
    isOwnerWithRequiredMfaLevel(user: typeof User): boolean;
    /**@deprecated */
    region: string;
}

declare module "@discord/classes" {
    export const Message: Message;
    export const User: User;
    export const Channel: Channel;
    export const Timestamp: Timestamp;


    const Classes: { Message, User, Channel, Timestamp };

    export default Classes;
}