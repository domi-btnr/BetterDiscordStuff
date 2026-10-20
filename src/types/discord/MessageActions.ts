import type { Channel, Message, User } from "@vencord/discord-types";

export interface MessageData {
    content: string;
    tts?: boolean;
    invalidEmojis?: unknown[];
    validNonShortcutEmojis?: unknown[];
    components?: unknown[];
    reaction?: boolean;
}

export interface MessageReference {
    guild_id?: string;
    channel_id: string;
    message_id: string;
    type?: number;
}

export interface AllowedMentions {
    parse?: string[];
    replied_user?: boolean;
}

export interface ActivityAction {
    type: number;
    targetUserId?: string;
    activity?: { session_id?: string; application_id?: string; party?: { id?: string } };
}

export interface AnnouncementSendOptions {
    createThread?: boolean;
    threadName?: string;
    publish?: boolean;
}

/** Response of Discord's message queue. `sendMessage` resolves with it and `endEditMessage` receives it. */
export interface MessageQueueResponse {
    ok: boolean;
    hasErr: boolean;
    status?: number;
    body?: any;
    err?: unknown;
}

export interface SendMessageOptions {
    nonce?: string;
    location?: string;
    flags?: number;
    eagerDispatch?: boolean;
    activityAction?: ActivityAction;
    inviteAnalyticsMetadata?: unknown;
    stickerIds?: string[];
    messageReference?: MessageReference;
    allowedMentions?: AllowedMentions;
    mediaMention?: unknown;
    poll?: unknown;
    sharedCustomTheme?: unknown;
    contentInventoryEntry?: unknown;
    attachments?: unknown[];
    attachmentsToUpload?: unknown[];
    onAttachmentUploadError?: (file: unknown, code: number, reason?: { msg?: string }, responseBody?: unknown) => void;
    announcementSendOptions?: AnnouncementSendOptions;
    doNotNotifyOnError?: boolean;
    withCheckpoint?: boolean;
    scheduledTimestamp?: number;
}

export interface PendingReply {
    channel: Channel;
    message: Message;
    shouldMention: boolean;
    mediaMention?: unknown;
}

export interface FetchMessagesOptions {
    channelId: string;
    before?: string;
    after?: string;
    limit?: number;
    jump?: {
        messageId?: string;
        flash?: boolean;
        offset?: number;
        returnMessageId?: string;
        jumpType?: unknown;
        onJumpComplete?: () => void;
        present?: boolean;
    };
    focus?: { messageId: string };
    isPreload?: boolean;
    skipLocalFetch?: boolean;
    truncate?: boolean;
    forICYMI?: boolean;
    avoidInitialScroll?: boolean;
    feature?: string;
    fetchKey?: number;
}

export interface JumpToMessageOptions {
    channelId: string;
    messageId: string;
    flash?: boolean;
    offset?: number;
    context?: string;
    extraProperties?: Record<string, unknown> | null;
    isPreload?: boolean;
    returnMessageId?: string;
    skipLocalFetch?: boolean;
    jumpType?: unknown;
    avoidInitialScroll?: boolean;
    onJumpComplete?: () => void;
}

export interface MessageActionsType {
    receiveMessage(
        channelId: string,
        message: Record<string, any>,
        optimistic?: boolean,
        sendMessageOptions?: SendMessageOptions
    ): void;
    sendBotMessage(channelId: string, content: string, loggingName?: string, messageId?: string): void;
    sendNitroSystemMessage(channelId: string, content: string, nonce?: string): void;
    sendGiftingPromptSystemMessage(channelId: string, giftingPrompt: unknown): void;
    sendGuildBoostUpsellSystemMessage(channelId: string, boostingPrompt: unknown): void;
    sendClydeError(channelId: string, code?: number): void;
    sendExplicitMediaClydeError(channelId: string, attachments?: unknown[], context?: unknown): void;

    truncateMessages(channelId: string, truncateBottom: boolean, truncateTop: boolean): void;
    clearChannel(channelId: string): void;
    jumpToPresent(channelId: string, limit: number): void;
    trackJump(
        channelId: string,
        messageId: string | null,
        context: string,
        extraProperties?: Record<string, unknown> | null
    ): void;
    jumpToMessage(options: JumpToMessageOptions): ReturnType<MessageActionsType["fetchMessages"]>;
    focusMessage(options: { channelId: string; messageId: string }): void;

    fetchMessage(options: { channelId: string; messageId: string }): Promise<Message | undefined>;
    fetchMessages(options: FetchMessagesOptions): false | void | Promise<unknown>;
    fetchLocalMessages(
        channelId: string,
        fetchKey: number,
        before?: string,
        after?: string,
        limit?: number,
        completion?: { markComplete(): void }
    ): Promise<void>;
    fetchNewLocalMessages(channelId: string, limit: number): Promise<void>;
    _tryFetchMessagesCached(options: FetchMessagesOptions): boolean | void;

    /**
     * Sends a message to a channel.
     * @param channelId The channel to send the message to.
     * @param message The message to send.
     * @param waitForChannelReady Waits until the channel is ready before sending. Defaults to `true`.
     * @param options Required, as Discord reads `options.nonce` without a null check.
     */
    sendMessage(
        channelId: string,
        message: MessageData,
        waitForChannelReady: boolean | undefined,
        options: SendMessageOptions
    ): Promise<MessageQueueResponse | void>;
    _sendMessage(
        channelId: string,
        message: MessageData,
        options: SendMessageOptions
    ): Promise<MessageQueueResponse | void>;
    getSendMessageOptionsForReply(pendingReply?: PendingReply | null): Partial<SendMessageOptions>;
    getSendMessageOptionsForStickers(options: { isGif?: boolean; stickers?: string[] }): { stickerIds?: string[] };
    getSendMessageOptionsForScheduledMessage(options: { scheduledTimestamp?: number }): {
        scheduledTimestamp?: number;
    };
    getSendMessageOptions(options: {
        pendingReply?: PendingReply | null;
        isGif?: boolean;
        stickers?: string[];
        scheduledTimestamp?: number;
    }): Partial<SendMessageOptions>;
    sendInvite(
        channelId: string,
        inviteCode: string,
        location: string,
        inviteAnalyticsMetadata?: unknown,
        prefix?: string
    ): Promise<unknown>;
    sendActivityBookmark(
        channelId: string,
        content: string,
        location: string,
        inviteAnalyticsMetadata?: unknown
    ): Promise<unknown>;
    sendStickers(
        channelId: string,
        stickerIds: string[],
        content?: string | MessageData,
        options?: SendMessageOptions,
        tts?: boolean
    ): Promise<unknown>;
    sendGreetMessage(
        channelId: string,
        stickerId: string,
        options?: { messageReference?: MessageReference; allowedMentions?: AllowedMentions }
    ): Promise<unknown>;
    sendPollMessage(channelId: string, poll: unknown, options?: SendMessageOptions): Promise<unknown>;
    validateMessage(
        invalidEmojis: { animated: boolean }[],
        user: User,
        channelId: string
    ): { errorMessage: string; errorMessageName: string };

    startEditMessage(channelId: string, messageId: string, content: string, source?: unknown): void;
    startEditMessageRecord(channelId: string, message: Message, source?: unknown): void;
    updateEditMessage(channelId: string, textValue: string, richValue: unknown): void;
    endEditMessage(channelId: string, response?: MessageQueueResponse): void;
    editMessage(
        channelId: string,
        messageId: string,
        message: { content: string; components?: unknown[] }
    ): Promise<void>;

    suppressEmbeds(channelId: string, messageId: string): Promise<void>;
    patchMessageGuildOfficial(channelId: string, messageId: string, isGuildOfficial: boolean): Promise<void>;
    patchMessageAttachments(channelId: string, messageId: string, attachments: unknown[]): Promise<unknown>;
    deleteMessage(channelId: string, messageId: string, local?: boolean): Promise<void>;
    dismissAutomatedMessage(message: Message & { loggingName?: string }): void;
    revealMessage(channelId: string, messageId: string): void;
    crosspostMessage(channelId: string, messageId: string): Promise<unknown>;
    trackInvite(options: {
        inviteKey: string;
        channelId: string;
        messageId: string;
        location: string;
        inviteAnalyticsMetadata?: unknown;
        overrideProperties?: Record<string, unknown>;
    }): void;
}
