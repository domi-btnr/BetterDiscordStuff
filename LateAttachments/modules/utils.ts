import { Message } from "@vencord/discord-types";

const MESSAGE_TYPE_DEFAULT = 0;
const MESSAGE_TYPE_REPLY = 19;
const VOICE_MESSAGE_FLAG = 1 << 13;

export function canAddAttachments(msg: Message) {
    return (
        [MESSAGE_TYPE_DEFAULT, MESSAGE_TYPE_REPLY].includes(msg.type) &&
        !msg.hasFlag(VOICE_MESSAGE_FLAG) &&
        msg.attachments.length < 10
    );
}
