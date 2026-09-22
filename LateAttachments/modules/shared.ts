import { Webpack } from "@api";
import {
    CloudUpload as CloudUploadType,
    EditMessageStore as EditMessageStoreType,
    UploadAttachmentStore as UploadAttachmentStoreType
} from "@vencord/discord-types";
import type { DraftType } from "@vencord/discord-types/enums";

import { LanguageModule as LanguageModuleType } from "../types";

export const EditMessageStore = Webpack.getStore("EditMessageStore") as unknown as EditMessageStoreType;

export const EDIT_DRAFT_TYPE = 67;

const UploadAttachmentStore = Webpack.getStore("UploadAttachmentStore") as unknown as UploadAttachmentStoreType;

export function getPendingUploads(channelId: string): CloudUploadType[] {
    return UploadAttachmentStore.getUploads(channelId, EDIT_DRAFT_TYPE as DraftType);
}

export function subscribeUploads(listener: () => void): () => void {
    UploadAttachmentStore.addChangeListener(listener);
    return () => UploadAttachmentStore.removeChangeListener(listener);
}

const LanguageModule = Webpack.getModule(m => m.intl) as LanguageModuleType | undefined;

export const Strings = {
    CHAT_ATTACH_UPLOAD_A_FILE: "d3+iYs"
};

export function getLocalizedString(key: string) {
    return LanguageModule?.intl.formatToPlainString(LanguageModule.t[key]);
}
