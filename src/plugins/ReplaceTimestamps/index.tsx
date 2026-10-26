import { Logger, Patcher } from "@api";
import showChangelog from "@common/Changelog";
import type { SettingsItem } from "@common/Settings";
import { Settings, SettingsPanel } from "@common/Settings";
import { MessageActions } from "@common/Webpack";
import manifest from "@manifest";

import { replaceTimestamps } from "./modules/timestamps";
import { useCreateForumPost } from "./modules/webpack";
import SettingsItems from "./settings.json";
import type { CreateForumPost } from "./types";

export default class ReplaceTimestamps {
    start() {
        const dateFormat = Settings.get<string | undefined>("dateFormat");
        if (dateFormat) {
            Settings.set("dateOrder", dateFormat.startsWith("MM") || dateFormat.startsWith("yyyy") ? "month" : "day");
            Settings.set("dateFormat", undefined);
        }

        showChangelog(manifest);
        this.patchMessageActions();
        this.patchForumPosts();
    }

    stop() {
        Patcher.unpatchAll();
    }

    patchMessageActions() {
        Patcher.before(MessageActions, "sendMessage", (_, [, message]) => {
            message.content = replaceTimestamps(message.content);
        });

        Patcher.before(MessageActions, "editMessage", (_, [, , message]) => {
            if (!Settings.get("applyToEdits", true)) return;
            message.content = replaceTimestamps(message.content);
        });
    }

    patchForumPosts() {
        if (!useCreateForumPost) return Logger.error("Failed to find useCreateForumPost");

        Patcher.after(...useCreateForumPost, (_, __, createPost: CreateForumPost) => {
            if (typeof createPost !== "function") return;
            return ((content, ...args) =>
                createPost(
                    typeof content === "string" ? replaceTimestamps(content) : content,
                    ...args
                )) satisfies CreateForumPost;
        });
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items as SettingsItem[]} />;
    }
}
