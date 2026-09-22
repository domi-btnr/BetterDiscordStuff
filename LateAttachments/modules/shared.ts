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

const submittingChannels = new Set<string>();
const submittingListeners = new Set<() => void>();

export function isSubmitting(channelId: string): boolean {
    return submittingChannels.has(channelId);
}

export function subscribeSubmitting(listener: () => void): () => void {
    submittingListeners.add(listener);
    return () => submittingListeners.delete(listener);
}

export function notifySubmittingListeners() {
    submittingListeners.forEach(listener => listener());
}

export function setSubmitting(channelId: string, submitting: boolean) {
    if (submitting) submittingChannels.add(channelId);
    else submittingChannels.delete(channelId);
    notifySubmittingListeners();
}

const LanguageModule = Webpack.getModule(m => m.intl) as LanguageModuleType | undefined;

export const Strings = {
    CHAT_ATTACH_UPLOAD_A_FILE: "d3+iYs"
};

export function getLocalizedString(key: string) {
    return LanguageModule?.intl.formatToPlainString(LanguageModule.t[key]);
}
