import { Components, Webpack } from "@api";
import React from "react";

import { activateUploadDialogue } from "../modules/attachments";
import { getLocalizedString, Strings } from "../modules/shared";

const PlusLargeIcon = (Webpack.getByKeys("PlusLargeIcon") as { PlusLargeIcon: React.ComponentType }).PlusLargeIcon;
const styles = {
    ...(Webpack.getByKeys("attachButtonInner") as Record<string, string>),
    ...(Webpack.getByKeys("buttonWrapper", "notificationDot") as Record<string, string>)
};

export default function AddAttachmentButton({
    channelId,
    existingAttachmentCount
}: {
    channelId: string;
    existingAttachmentCount: number;
}) {
    return (
        <Components.Tooltip text={getLocalizedString(Strings.CHAT_ATTACH_UPLOAD_A_FILE)}>
            {props => (
                <div
                    {...props}
                    className={[styles.attachButton, styles.button].join(" ")}
                    onClick={() => activateUploadDialogue(channelId, existingAttachmentCount)}
                >
                    <div
                        className={[styles.buttonWrapper, styles.attachButtonInner].join(" ")}
                        style={{ height: "auto" }}
                    >
                        <PlusLargeIcon />
                    </div>
                </div>
            )}
        </Components.Tooltip>
    );
}
