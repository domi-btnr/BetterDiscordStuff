import { Hooks } from "@api";
import { Settings } from "@common/Settings";
import type { Channel, Message, MessageAttachment } from "@vencord/discord-types";

import type { AttachmentKind, Location } from "../types";
import { t } from "./i18n";
import { ChannelActions, MessageStore } from "./webpack";

const IS_VOICE_MESSAGE = 1 << 13;

const ATTACHMENT_GROUPS = {
    image: "content.image",
    gif: "content.image",
    video: "content.video",
    audio: "content.file",
    file: "content.file"
} as const;

export function useLastMessage(channelId: string): Message | undefined {
    return Hooks.useStateFromStores([MessageStore] as any, () => MessageStore.getMessages(channelId)?.last(), [
        channelId
    ]);
}

/**
 * Loads the last message of the first channels that have none loaded yet, up to the "Preload Limit" setting.
 * Each channel is an API request, so they're sent one at a time with a growing cooldown (125ms, 250ms, …).
 */
export function preloadChannels(guildId: string, channels: Channel[], signal: AbortSignal) {
    channels
        .filter(channel => channel.lastMessageId && !MessageStore.getMessages(channel.id)?.last())
        .slice(0, Settings.get("preloadLimit", 10))
        .reduce<Promise<unknown>>(
            (promise, channel, index) =>
                promise.then(() => {
                    if (signal.aborted) return;
                    ChannelActions?.preload(guildId, channel.id);
                    return new Promise(resolve => setTimeout(resolve, 125 + index * 125));
                }),
            Promise.resolve()
        );
}

function getAttachmentKind({ content_type: type = "" }: MessageAttachment): AttachmentKind {
    if (type === "image/gif") return "gif";
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    return "file";
}

export function hasPreview(channelId: string, location: Location) {
    if (!Settings.get(location === "dm" ? "showInDMs" : "showInGuilds", true)) return false;
    const message = MessageStore.getMessages(channelId)?.last();
    return !!message && !!getMessagePreview(message);
}

/** The text of `message`, or what it contains when it has none, using Discord's own descriptions like "Sent an image". */
export function getMessagePreview(message: Message) {
    const [embed] = message.embeds;
    const isGif = String(embed?.type) === "gifv" && message.content === embed.url;
    if (message.content && !isGif) return message.content;
    if (embed?.rawDescription) return embed.rawDescription;
    if (isGif) return t("content.gif");
    if (message.messageSnapshots?.length) return t("content.forwarded");
    if (message.poll) return t("content.poll");
    if (message.stickerItems?.length) return t("content.sticker");
    if (message.flags & IS_VOICE_MESSAGE) return t("content.voiceMessage");

    const kinds = message.attachments.map(getAttachmentKind);
    if (kinds.length === 1) return t(`content.${kinds[0]}`);
    if (kinds.length > 1) {
        const groups = new Set(kinds.map(kind => ATTACHMENT_GROUPS[kind]));
        const [group] = groups;
        return t(groups.size === 1 ? group : "content.attachment", { count: kinds.length });
    }

    if (embed || message.components.length) return t("content.message");
}
