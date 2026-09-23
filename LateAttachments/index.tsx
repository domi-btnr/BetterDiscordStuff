import { Patcher, Webpack } from "@api";
import showChangelog from "@common/Changelog";
import manifest from "@manifest";
import React from "react";

import AddAttachmentButton from "./components/AddAttachmentButton";
import EditAttachmentsBar from "./components/EditAttachmentsBar";
import { commitPendingUploads } from "./modules/attachments";
import { handlePaste } from "./modules/paste";
import { EditMessageStore, getPendingUploads } from "./modules/shared";
import { isSubmitting, subscribeSubmitting } from "./modules/submitting";
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

    async patchEditForm() {
        const EditForm = ((await Webpack.waitForModule(Webpack.Filters.bySource("onClickSave"))) as any)
            ?.A as EditFormClass;

        const patchedEditFormInstances = new WeakSet<object>();

        Patcher.before(EditForm.prototype, "render", instance => {
            const editFormInstance = instance as unknown as EditFormInstance;
            if (patchedEditFormInstances.has(editFormInstance)) return;
            patchedEditFormInstances.add(editFormInstance);

            subscribeSubmitting(() => editFormInstance.forceUpdate());

            const originalOnSubmit = editFormInstance.onSubmit.bind(editFormInstance);
            const originalOnChange = editFormInstance.onChange.bind(editFormInstance);

            editFormInstance.onSubmit = async value => {
                const { channel, message } = editFormInstance.props;
                const uploads = getPendingUploads(channel.id);

                if (uploads.length) {
                    const committed = await commitPendingUploads(channel.id, message.id, message.content, uploads);
                    if (!committed) return { shouldClear: false, shouldRefocus: false };
                }

                return originalOnSubmit(value);
            };

            editFormInstance.onChange = (...args: unknown[]) => {
                if (!isSubmitting(editFormInstance.props.channel.id)) originalOnChange(...args);
            };
        });

        Patcher.after(EditForm.prototype, "render", (instance, _args, res) => {
            const editFormInstance = instance as unknown as EditFormInstance;
            const channelId = editFormInstance.props.channel.id;
            const children = (res as any)?.props?.children;
            if (!Array.isArray(children)) return;

            const submitting = isSubmitting(channelId);

            if (submitting && editFormInstance.node.current?.contains(document.activeElement)) {
                (document.activeElement as HTMLElement).blur();
            }

            if (submitting) {
                children[0] = <div style={{ opacity: 0.5, pointerEvents: "none" }}>{children[0]}</div>;
            }
            children[1] = submitting ? null : children[1];
            children.splice(1, 0, <EditAttachmentsBar channelId={channelId} />);
        });
    }
}
