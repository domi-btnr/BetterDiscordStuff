import { Patcher, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";
import { getRelativeTime, getUnixTimestamp } from "./modules/utils";

export let timeRegexMatch, dateRegexMatch, relativeRegexMatch;

export default class ReplaceTimestamps {
    start() {
        showChangelog(manifest);
        this.patchMessageActions();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchMessageActions() {
        const MessageActions = Webpack.getByKeys("sendMessage", "editMessage");

        const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
        timeRegexMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;

        const dateFormat = Settings.get("dateFormat", "dd.MM.yyyy")
            .replace(/[./]/g, "[./]")
            .replace("dd", "(\\d{2})")
            .replace("MM", "(\\d{2})")
            .replace("yyyy", "(\\d{4})");

        const dateRegex = new RegExp(`${dateFormat}`, "gi");
        dateRegexMatch = new RegExp(`${dateFormat}`, "i");

        const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
        const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");

        const relativeRegex = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/gi;
        relativeRegexMatch = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/i;

        const processMessageContent = content => content
            .replace(TimeDateRegex, x => getUnixTimestamp(x))
            .replace(DateRegexTime, x => getUnixTimestamp(x))
            .replace(timeRegex, x => getUnixTimestamp(x, "t"))
            .replace(dateRegex, x => getUnixTimestamp(x, "d"))
            .replace(relativeRegex, getRelativeTime);

        Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            msg.content = processMessageContent(msg.content);
        });

        Patcher.before(MessageActions, "editMessage", (_, [, , msg]) => {
            if (!Settings.get("applyToEdits", true)) return;
            msg.content = processMessageContent(msg.content);
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
