import type { Channel, Message, WebUploadItem } from "@vencord/discord-types";
import type { RefObject } from "react";

type ChatButtonsProps = {
    type: {
        analyticsName: string;
        attachments: boolean;
        autocomplete: {
            addReactionShortcut: boolean;
            forceChatLayer: boolean;
            reactions: boolean;
        };
        commands: {
            enabled: boolean;
        };
        confetti: {
            button: boolean;
        };
        drafts: {
            type: number;
            commandType: number;
            autoSave: boolean;
        };
        emojis: {
            button: boolean;
        };
        gifs: {
            button: boolean;
            allowSending: boolean;
        };
        gifts: {
            button: boolean;
        };
        permissions: {
            requireSendMessages: boolean;
        };
        showThreadPromptOnReply: boolean;
        stickers: {
            button: boolean;
            allowSending: boolean;
            autoSuggest: boolean;
        };
        soundmoji: {
            allowSending: boolean;
        };
        users: {
            allowMentioning: boolean;
        };
        submit: {
            button: boolean;
            ignorePreference: boolean;
            disableEnterToSubmit: boolean;
            clearOnSubmit: boolean;
            useDisabledStylesOnSubmit: boolean;
        };
        uploadLongMessages: boolean;
        upsellLongMessages: {
            iconOnly: boolean;
        };
        showCharacterCount: boolean;
        sedReplace: boolean;
        showSlowmodeIndicator: boolean;
        showTypingIndicator: boolean;
    };
    disabled: boolean;
    channel: Channel;
    isEmpty: boolean;
    showAllButtons: boolean;
    textValue?: string;
};

export type ChatButtonsArgs = [ChatButtonsProps, any];

export type ChatButtonsGroup = {
    // eslint-disable-next-line no-unused-vars
    type(...args: any[]): any;
};

export interface RemoteAttachment {
    id: string;
    upload_url: string;
    upload_filename: string;
}

export interface EditFormInstance {
    props: {
        channel: Channel;
        message: Message;
    };
    node: RefObject<HTMLElement>;
    forceUpdate(): void;
    render(): unknown;
    // eslint-disable-next-line no-unused-vars
    onSubmit(value: string): Promise<{ shouldClear: boolean; shouldRefocus: boolean }>;
    // eslint-disable-next-line no-unused-vars
    onChange(...args: unknown[]): void;
}

export type EditFormClass = {
    prototype: EditFormInstance;
};

export type FileUtils = {
    // eslint-disable-next-line no-unused-vars
    addFile(options: { channelId: string; draftType: number; file: WebUploadItem }): void;
    // eslint-disable-next-line no-unused-vars
    remove(channelId: string, uploadId: string, draftType: number): void;
};

export type LanguageModule = {
    t: Record<string, unknown>;
    intl: {
        // eslint-disable-next-line no-unused-vars
        formatToPlainString(message: unknown): string;
    };
};
