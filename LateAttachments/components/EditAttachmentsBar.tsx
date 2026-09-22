import { Webpack } from "@api";
import { CloudUpload } from "@vencord/discord-types";
import React from "react";

import { EDIT_DRAFT_TYPE, getPendingUploads, subscribeUploads } from "../modules/shared";
import { isSubmitting, subscribeSubmitting } from "../modules/submitting";

const ATTACHMENT_AREA_TYPE = { drafts: { type: EDIT_DRAFT_TYPE } };
const AttachmentArea = (Webpack.getBySource("ignoreUploadId", ".ATTACHMENT", "smallAttachments") as any)?.A;
const UploadProgress = (Webpack.getBySource(".filesize", ".progress") as any)?.e;

function combineUploads(uploads: CloudUpload[]) {
    const totalSize = uploads.reduce((sum, upload) => sum + (upload.item?.file?.size ?? 0), 0);
    const uploadedSize = uploads.reduce((sum, upload) => sum + (upload.currentSize ?? 0), 0);

    return {
        id: uploads.map(upload => upload.id).join(","),
        items: uploads.map(upload => ({ filename: upload.filename })),
        progress: totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0,
        currentSize: uploadedSize
    };
}

export default function EditAttachmentsBar({ channelId }: { channelId: string }) {
    const uploads = React.useSyncExternalStore(subscribeUploads, () => getPendingUploads(channelId));
    const submitting = React.useSyncExternalStore(subscribeSubmitting, () => isSubmitting(channelId));

    if (!uploads.length) return null;

    if (!submitting) {
        if (!AttachmentArea) return null;
        return <AttachmentArea channelId={channelId} type={ATTACHMENT_AREA_TYPE} canAttachFiles smallAttachments />;
    }

    if (!UploadProgress) return null;

    const file = uploads.length > 1 ? combineUploads(uploads) : uploads[0];
    return <UploadProgress channelId={channelId} file={file} />;
}
