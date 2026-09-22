import { Webpack } from "@api";
import { SelectedChannelStore } from "@vencord/discord-types";

import { addFiles } from "./attachments";
import { EditMessageStore } from "./shared";
import { canAddAttachments } from "./utils";

const SelectedChannelStoreModule = Webpack.getStore("SelectedChannelStore") as unknown as SelectedChannelStore;

export function handlePaste(event: ClipboardEvent) {
    const files = event.clipboardData?.files;
    if (!files?.length) return;

    const channelId = SelectedChannelStoreModule.getChannelId();
    const message = channelId && EditMessageStore.getEditingMessage(channelId);
    if (!message || !canAddAttachments(message)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    addFiles(channelId, message.attachments.length, Array.from(files));
}
