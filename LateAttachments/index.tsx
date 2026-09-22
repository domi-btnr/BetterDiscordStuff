import { Patcher, Webpack } from "@api";
import showChangelog from "@common/Changelog";
import manifest from "@manifest";
import React from "react";

import AddAttachmentButton from "./components/AddAttachmentButton";
import EditAttachmentsBar from "./components/EditAttachmentsBar";
import EditComposerLock from "./components/EditComposerLock";
import EditFormHint from "./components/EditFormHint";
import { commitPendingUploads } from "./modules/attachments";
import { handlePaste } from "./modules/paste";
import { EditMessageStore, getPendingUploads, isSubmitting } from "./modules/shared";
import { canAddAttachments } from "./modules/utils";
import { ChatButtonsArgs, ChatButtonsGroup, EditFormClass, EditFormInstance } from "./types";

export default class LateAttachments {
    start() {
        showChangelog(manifest);
        this.patchChannelTextArea();
        this.patchEditForm();
        document.addEventListener("paste", handlePaste, { capture: true });
    }

    stop() {
        Patcher.unpatchAll();
        document.removeEventListener("paste", handlePaste, { capture: true });
    }

    patchChannelTextArea() {
        const ChatButtonsGroup = (Webpack.getBySource("isSubmitButtonEnabled", ".A.getActiveOption(") as any)
            ?.A as ChatButtonsGroup;

        Patcher.after(ChatButtonsGroup, "type", (_, methodArgs, res) => {
            const [{ channel, disabled, type }] = methodArgs as ChatButtonsArgs;
            const message = EditMessageStore.getEditingMessage(channel.id);

            if (
                !disabled &&
                type.analyticsName === "edit" &&
                message &&
                canAddAttachments(message) &&
                Array.isArray(res.props?.children)
            ) {
                res.props.children.unshift(
                    <AddAttachmentButton channelId={channel.id} existingAttachmentCount={message.attachments.length} />
                );
            }
        });
    }

    patchEditForm() {
        const EditForm = (Webpack.getBySource("onClickSave") as any)?.A as EditFormClass;

        this.patchEditFormSubmit(EditForm);
        this.patchEditFormAttachmentsUI(EditForm);
    }

    patchEditFormSubmit(EditForm: EditFormClass) {
        const patchedEditFormInstances = new WeakSet<object>();

        async function submitEdit(
            thisObject: EditFormInstance,
            value: string,
            originalOnSubmit: EditFormInstance["onSubmit"]
        ) {
            const { channel, message } = thisObject.props;
            const uploads = getPendingUploads(channel.id);

            if (uploads.length) {
                const committed = await commitPendingUploads(channel.id, message.id, message.content, uploads);
                if (!committed) return { shouldClear: false, shouldRefocus: false };
            }

            return originalOnSubmit(value);
        }

        Patcher.before(EditForm.prototype, "render", instance => {
            const editFormInstance = instance as unknown as EditFormInstance;
            if (patchedEditFormInstances.has(editFormInstance)) return;
            patchedEditFormInstances.add(editFormInstance);

            const originalOnSubmit = editFormInstance.onSubmit.bind(editFormInstance);
            const originalOnChange = editFormInstance.onChange.bind(editFormInstance);

            editFormInstance.onSubmit = value => submitEdit(editFormInstance, value, originalOnSubmit);

            editFormInstance.onChange = (...args: unknown[]) => {
                if (!isSubmitting(editFormInstance.props.channel.id)) originalOnChange(...args);
            };
        });
    }

    patchEditFormAttachmentsUI(EditForm: EditFormClass) {
        Patcher.after(EditForm.prototype, "render", (instance, _args, res) => {
            const editFormInstance = instance as unknown as EditFormInstance;
            const channelId = editFormInstance.props.channel.id;
            const children = (res as any)?.props?.children;
            if (!Array.isArray(children)) return;

            children[0] = <EditComposerLock channelId={channelId}>{children[0]}</EditComposerLock>;
            children[1] = <EditFormHint channelId={channelId} originalHint={children[1]} />;
            children.splice(1, 0, <EditAttachmentsBar channelId={channelId} />);
        });
    }
}
