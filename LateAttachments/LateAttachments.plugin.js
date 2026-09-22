/**
 * @runAt idle
 * @name LateAttachments
 * @version 1.0.0
 * @description Allows you to add attachments to messages when editing them
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/LateAttachments
 */

'use strict';

/* @manifest */
const manifest = {
    "$schema": "../common/Schemas/manifest.schema.json",
    "runAt": "idle",
    "name": "LateAttachments",
    "version": "1.0.0",
    "description": "Allows you to add attachments to messages when editing them",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/LateAttachments",
    "changelog": {
        "date": "2026-09-22",
        "changes": [{
            "type": "added",
            "title": "Added",
            "items": [
                "Add new attachments to a message while editing it, right from the edit textbox",
                "Paste files directly into the edit textbox to attach them",
                "Mark attachments as spoilers before saving",
                "Live upload progress while saving"
            ]
        }]
    }
};

/* @api */
const {
    Components,
    Data,
    DOM,
    Logger,
    Patcher,
    UI,
    Webpack
} = new BdApi(manifest.name);

/* react */
var React = BdApi.React;

/* ../common/Changelog/footer.tsx */
const {
    Text
} = Components;

function Footer({
    manifest
}) {
    if (!manifest.invite && !manifest.source) return null;
    let issuesUrl;
    if (manifest.source) {
        const url = new URL(manifest.source);
        const [, owner, repo] = url.pathname.split("/");
        url.pathname = `/${owner}/${repo}/issues`;
        issuesUrl = url.toString();
    }
    return React.createElement(Text, null, "Need support?", " ", manifest.invite && React.createElement(React.Fragment, null, "Join the", " ", React.createElement("a", {
        onClick: () => UI.showInviteModal(manifest.invite),
        style: {
            textDecoration: "underline"
        }
    }, "Discord Server"), manifest.source && " or "), manifest.source && React.createElement(React.Fragment, null, "Check for Issues on", " ", React.createElement("a", {
        href: issuesUrl,
        target: "_blank",
        rel: "noreferrer",
        style: {
            textDecoration: "underline"
        }
    }, "GitHub")));
}

/* ../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog) return;
    const {
        date,
        title,
        subtitle,
        ...changelog
    } = manifest.changelog;
    if (!changelog.changes?.length && !changelog.blurb && !changelog.video && !changelog.banner) return;
    const i18n = Webpack.getByKeys("getLocale");
    const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog,
        footer: React.createElement(Footer, {
            manifest
        })
    });
    Data.save("lastVersion", manifest.version);
}

/* modules/shared.ts */
const EditMessageStore = Webpack.getStore("EditMessageStore");
const EDIT_DRAFT_TYPE = 67;
const UploadAttachmentStore = Webpack.getStore("UploadAttachmentStore");

function getPendingUploads(channelId) {
    return UploadAttachmentStore.getUploads(channelId, EDIT_DRAFT_TYPE);
}

function subscribeUploads(listener) {
    UploadAttachmentStore.addChangeListener(listener);
    return () => UploadAttachmentStore.removeChangeListener(listener);
}
const LanguageModule = Webpack.getModule((m) => m.intl);
const Strings = {
    CHAT_ATTACH_UPLOAD_A_FILE: "d3+iYs"
};

function getLocalizedString(key) {
    return LanguageModule?.intl.formatToPlainString(LanguageModule.t[key]);
}

/* modules/submitting.ts */
const submittingChannels = new Set();
const submittingListeners = new Set();

function isSubmitting(channelId) {
    return submittingChannels.has(channelId);
}

function subscribeSubmitting(listener) {
    submittingListeners.add(listener);
    return () => submittingListeners.delete(listener);
}

function notifySubmittingListeners() {
    submittingListeners.forEach((listener) => listener());
}

function setSubmitting(channelId, submitting) {
    if (submitting) submittingChannels.add(channelId);
    else submittingChannels.delete(channelId);
    notifySubmittingListeners();
}

/* modules/attachments.ts */
const PLATFORM_WEB = 1;
const MAX_ATTACHMENTS = 10;
const FileUtils = Webpack.getByKeys("addFile", "remove");
const RestAPIModule = Webpack.getModule((m) => typeof m === "object" && m.del && m.put, {
    searchExports: true
});
const MessageStore = Webpack.getStore("MessageStore");

function addFiles(channelId, existingAttachmentCount, files) {
    const remaining = MAX_ATTACHMENTS - existingAttachmentCount - getPendingUploads(channelId).length;
    if (remaining <= 0) {
        UI.showToast("You cannot add more attachments to this message.", {
            type: "error"
        });
        return;
    }
    if (files.length > remaining) {
        UI.showToast(`You can only add ${remaining} more attachment${remaining === 1 ? "" : "s"}.`, {
            type: "error"
        });
    }
    for (const file of files.slice(0, remaining)) {
        FileUtils.addFile({
            channelId,
            draftType: EDIT_DRAFT_TYPE,
            file: {
                platform: PLATFORM_WEB,
                file
            }
        });
    }
}

function activateUploadDialogue(channelId, existingAttachmentCount) {
    const input = DOM.createElement("input", {
        type: "file",
        multiple: true
    });
    input.addEventListener("change", () => {
        addFiles(channelId, existingAttachmentCount, Array.from(input.files ?? []));
        input.remove();
    });
    input.click();
}

function clearPendingUploads(channelId, uploads) {
    uploads.forEach((upload) => FileUtils.remove(channelId, upload.id, EDIT_DRAFT_TYPE));
}
async function commitPendingUploads(channelId, messageId, content, uploads) {
    if (isSubmitting(channelId)) return false;
    setSubmitting(channelId, true);
    try {
        await submitEditWithAttachments(channelId, messageId, {
            content
        }, uploads);
        clearPendingUploads(channelId, uploads);
        return true;
    } catch (error) {
        Logger.error("Failed to add attachments to message", error);
        UI.showToast("Failed to add attachments to the message.", {
            type: "error"
        });
        return false;
    } finally {
        setSubmitting(channelId, false);
    }
}

function putFile(url, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.upload.onprogress = (event) => {
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
async function submitEditWithAttachments(channelId, messageId, payload, uploads) {
    const files = uploads.map((upload) => upload.item.file);
    const filenames = uploads.map((upload, i) => upload.spoiler ? `SPOILER_${files[i].name}` : files[i].name);
    const {
        body: {
            attachments
        }
    } = await RestAPIModule.post({
        url: `/channels/${channelId}/attachments`,
        body: {
            files: files.map((file, i) => ({
                filename: filenames[i],
                file_size: file.size,
                id: String(i),
                is_clip: false
            }))
        }
    });
    const newAttachments = await Promise.all(
        attachments.map((attachment, i) => {
            const file = files[i];
            const upload = uploads[i];
            return putFile(attachment.upload_url, file, (loaded) => {
                upload.currentSize = loaded;
                upload.progress = Math.round(loaded / file.size * 100);
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

/* components/AddAttachmentButton.tsx */
const PlusLargeIcon = Webpack.getByKeys("PlusLargeIcon").PlusLargeIcon;
const styles = {
    ...Webpack.getByKeys("attachButtonInner"),
    ...Webpack.getByKeys("buttonWrapper", "notificationDot")
};

function AddAttachmentButton({
    channelId,
    existingAttachmentCount
}) {
    return React.createElement(Components.Tooltip, {
        text: getLocalizedString(Strings.CHAT_ATTACH_UPLOAD_A_FILE)
    }, (props) => React.createElement(
        "div", {
            ...props,
            className: [styles.attachButton, styles.button].join(" "),
            onClick: () => activateUploadDialogue(channelId, existingAttachmentCount)
        },
        React.createElement(
            "div", {
                className: [styles.buttonWrapper, styles.attachButtonInner].join(" "),
                style: {
                    height: "auto"
                }
            },
            React.createElement(PlusLargeIcon, null)
        )
    ));
}

/* components/EditAttachmentsBar.tsx */
const AttachmentArea = Webpack.getById(822610)?.A;
const ATTACHMENT_AREA_TYPE = {
    drafts: {
        type: EDIT_DRAFT_TYPE
    }
};
const UploadProgress = Webpack.getById(564771)?.e;

function combineUploads(uploads) {
    const totalSize = uploads.reduce((sum, upload) => sum + (upload.item?.file?.size ?? 0), 0);
    const uploadedSize = uploads.reduce((sum, upload) => sum + (upload.currentSize ?? 0), 0);
    return {
        id: uploads.map((upload) => upload.id).join(","),
        items: uploads.map((upload) => ({
            filename: upload.filename
        })),
        progress: totalSize > 0 ? Math.round(uploadedSize / totalSize * 100) : 0,
        currentSize: uploadedSize
    };
}

function EditAttachmentsBar({
    channelId
}) {
    const uploads = React.useSyncExternalStore(subscribeUploads, () => getPendingUploads(channelId));
    const submitting = React.useSyncExternalStore(subscribeSubmitting, () => isSubmitting(channelId));
    if (!uploads.length) return null;
    if (!submitting) {
        if (!AttachmentArea) return null;
        return React.createElement(AttachmentArea, {
            channelId,
            type: ATTACHMENT_AREA_TYPE,
            canAttachFiles: true,
            smallAttachments: true
        });
    }
    if (!UploadProgress) return null;
    const file = uploads.length > 1 ? combineUploads(uploads) : uploads[0];
    return React.createElement(UploadProgress, {
        channelId,
        file
    });
}

/* modules/utils.ts */
const MESSAGE_TYPE_DEFAULT = 0;
const MESSAGE_TYPE_REPLY = 19;
const VOICE_MESSAGE_FLAG = 1 << 13;

function canAddAttachments(msg) {
    return [MESSAGE_TYPE_DEFAULT, MESSAGE_TYPE_REPLY].includes(msg.type) && !msg.hasFlag(VOICE_MESSAGE_FLAG) && msg.attachments.length < 10;
}

/* modules/paste.ts */
const SelectedChannelStoreModule = Webpack.getStore("SelectedChannelStore");

function handlePaste(event) {
    const files = event.clipboardData?.files;
    if (!files?.length) return;
    const channelId = SelectedChannelStoreModule.getChannelId();
    const message = channelId && EditMessageStore.getEditingMessage(channelId);
    if (!message || !canAddAttachments(message)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addFiles(channelId, message.attachments.length, Array.from(files));
}

/* index.tsx */
class LateAttachments {
    start() {
        showChangelog(manifest);
        this.patchChannelTextArea();
        this.patchEditForm();
        document.addEventListener("paste", handlePaste, {
            capture: true
        });
    }
    stop() {
        Patcher.unpatchAll();
        document.removeEventListener("paste", handlePaste, {
            capture: true
        });
    }
    patchChannelTextArea() {
        const ChatButtonsGroup2 = Webpack.getBySource("isSubmitButtonEnabled", ".A.getActiveOption(")?.A;
        Patcher.after(ChatButtonsGroup2, "type", (_, methodArgs, res) => {
            const [{
                channel,
                disabled,
                type
            }] = methodArgs;
            const message = EditMessageStore.getEditingMessage(channel.id);
            if (!disabled && type.analyticsName === "edit" && message && canAddAttachments(message) && Array.isArray(res.props?.children)) {
                res.props.children.unshift(
                    React.createElement(AddAttachmentButton, {
                        channelId: channel.id,
                        existingAttachmentCount: message.attachments.length
                    })
                );
            }
        });
    }
    patchEditForm() {
        const EditForm = Webpack.getBySource("onClickSave")?.A;
        this.patchEditFormSubmit(EditForm);
        this.patchEditFormAttachmentsUI(EditForm);
    }
    patchEditFormSubmit(EditForm) {
        const patchedEditFormInstances = new WeakSet();
        async function submitEdit(thisObject, value, originalOnSubmit) {
            const {
                channel,
                message
            } = thisObject.props;
            const uploads = getPendingUploads(channel.id);
            if (uploads.length) {
                const committed = await commitPendingUploads(channel.id, message.id, message.content, uploads);
                if (!committed) return {
                    shouldClear: false,
                    shouldRefocus: false
                };
            }
            return originalOnSubmit(value);
        }
        Patcher.before(EditForm.prototype, "render", (instance) => {
            const editFormInstance = instance;
            if (patchedEditFormInstances.has(editFormInstance)) return;
            patchedEditFormInstances.add(editFormInstance);
            subscribeSubmitting(() => editFormInstance.forceUpdate());
            const originalOnSubmit = editFormInstance.onSubmit.bind(editFormInstance);
            const originalOnChange = editFormInstance.onChange.bind(editFormInstance);
            editFormInstance.onSubmit = (value) => submitEdit(editFormInstance, value, originalOnSubmit);
            editFormInstance.onChange = (...args) => {
                if (!isSubmitting(editFormInstance.props.channel.id)) originalOnChange(...args);
            };
        });
    }
    patchEditFormAttachmentsUI(EditForm) {
        Patcher.after(EditForm.prototype, "render", (instance, _args, res) => {
            const editFormInstance = instance;
            const channelId = editFormInstance.props.channel.id;
            const children = res?.props?.children;
            if (!Array.isArray(children)) return;
            const submitting = isSubmitting(channelId);
            if (submitting && editFormInstance.node.current?.contains(document.activeElement)) {
                document.activeElement.blur();
            }
            if (submitting) {
                children[0] = React.createElement("div", {
                    style: {
                        opacity: 0.5,
                        pointerEvents: "none"
                    }
                }, children[0]);
            }
            children[1] = submitting ? null : children[1];
            children.splice(1, 0, React.createElement(EditAttachmentsBar, {
                channelId
            }));
        });
    }
}

module.exports = LateAttachments;