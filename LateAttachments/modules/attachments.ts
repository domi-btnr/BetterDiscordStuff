import { DOM, Logger, UI, Webpack } from "@api";
import { CloudUpload as CloudUploadType, MessageStore as MessageStoreType, RestAPI } from "@vencord/discord-types";
import type { CloudUploadPlatform } from "@vencord/discord-types/enums";

import { FileUtils as FileUtilsType, RemoteAttachment } from "../types";
import { EDIT_DRAFT_TYPE, getPendingUploads } from "./shared";
import { isSubmitting, notifySubmittingListeners, setSubmitting } from "./submitting";

const PLATFORM_WEB: CloudUploadPlatform.WEB = 1;
const MAX_ATTACHMENTS = 10;

const FileUtils = Webpack.getByKeys("addFile", "remove") as FileUtilsType;
const RestAPIModule = Webpack.getModule(m => typeof m === "object" && m.del && m.put, {
    searchExports: true
}) as RestAPI;
const MessageStore = Webpack.getStore("MessageStore") as unknown as MessageStoreType;

export function addFiles(channelId: string, existingAttachmentCount: number, files: File[]) {
    const remaining = MAX_ATTACHMENTS - existingAttachmentCount - getPendingUploads(channelId).length;

    if (remaining <= 0) {
        UI.showToast("You cannot add more attachments to this message.", { type: "error" });
        return;
    }

    if (files.length > remaining) {
        UI.showToast(`You can only add ${remaining} more attachment${remaining === 1 ? "" : "s"}.`, {
            type: "error"
        });
    }

    for (const file of files.slice(0, remaining)) {
        FileUtils.addFile({ channelId, draftType: EDIT_DRAFT_TYPE, file: { platform: PLATFORM_WEB, file } });
    }
}

export function activateUploadDialogue(channelId: string, existingAttachmentCount: number) {
    const input = DOM.createElement("input", {
        type: "file",
        multiple: true
    }) as HTMLInputElement;

    input.addEventListener("change", () => {
        addFiles(channelId, existingAttachmentCount, Array.from(input.files ?? []));
        input.remove();
    });

    input.click();
}

export function clearPendingUploads(channelId: string, uploads: CloudUploadType[]) {
    uploads.forEach(upload => FileUtils.remove(channelId, upload.id, EDIT_DRAFT_TYPE));
}

export async function commitPendingUploads(
    channelId: string,
    messageId: string,
    content: string,
    uploads: CloudUploadType[]
): Promise<boolean> {
    if (isSubmitting(channelId)) return false;

    setSubmitting(channelId, true);

    try {
        await submitEditWithAttachments(channelId, messageId, { content }, uploads);
        clearPendingUploads(channelId, uploads);
        return true;
    } catch (error) {
        Logger.error("Failed to add attachments to message", error);
        UI.showToast("Failed to add attachments to the message.", { type: "error" });
        return false;
    } finally {
        setSubmitting(channelId, false);
    }
}

// eslint-disable-next-line no-unused-vars
function putFile(url: string, file: File, onProgress: (loaded: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.upload.onprogress = event => {
            if (event.lengthComputable) onProgress(event.loaded);
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
    });
}

async function submitEditWithAttachments(
    channelId: string,
    messageId: string,
    payload: { content?: string },
    uploads: CloudUploadType[]
) {
    const files = uploads.map(upload => upload.item.file);
    const filenames = uploads.map((upload, i) => (upload.spoiler ? `SPOILER_${files[i].name}` : files[i].name));

    const {
        body: { attachments }
    } = (await RestAPIModule.post({
        url: `/channels/${channelId}/attachments`,
        body: {
            files: files.map((file, i) => ({
                filename: filenames[i],
                file_size: file.size,
                id: String(i),
                is_clip: false
            }))
        }
    })) as { body: { attachments: RemoteAttachment[] } };

    const newAttachments = await Promise.all(
        attachments.map((attachment, i) => {
            const file = files[i];
            const upload = uploads[i] as CloudUploadType & { progress: number };

            return putFile(attachment.upload_url, file, loaded => {
                upload.currentSize = loaded;
                upload.progress = Math.round((loaded / file.size) * 100);
                notifySubmittingListeners();
            }).then(() => ({
                id: attachment.id,
                uploaded_filename: attachment.upload_filename,
                filename: filenames[i]
            }));
        })
    );

    const existingMessage = MessageStore.getMessage(channelId, messageId);

    return RestAPIModule.patch({
        url: `/channels/${channelId}/messages/${messageId}`,
        body: {
            content: payload?.content,
            attachments: [...existingMessage.attachments, ...newAttachments]
        }
    });
}
