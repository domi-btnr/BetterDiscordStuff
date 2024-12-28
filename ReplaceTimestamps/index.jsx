import React from "react";
import { Data, Patcher, Webpack, UI } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";
import { getRelativeTime, getUnixTimestamp } from "./modules/utils";
import "./changelog.scss";

export let timeRegexMatch, dateRegexMatch, relativeRegexMatch;

export default class ReplaceTimestamps {
    start() {
        this.showChangelog();
        this.patchSendMessage();
        Styles.load();
    }

    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    showChangelog() {
        if (
            !manifest.changelog.length ||
            Settings.get("lastVersion") === manifest.version
        ) return;

        const i18n = Webpack.getByKeys("getLocale");
        const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        const title = (
            <div className="Changelog-Title-Wrapper">
                <h1>What's New - {manifest.name}</h1>
                <div>{formatter.format(new Date(manifest.changelogDate))} - v{manifest.version}</div>
            </div>
        )

        const items = manifest.changelog.map(item => (
            <div className="Changelog-Item">
                <h4 className={`Changelog-Header ${item.type}`}>{item.title}</h4>
                {item.items.map(item => (
                    <span>{item}</span>
                ))}
            </div>
        ));

        "changelogImage" in manifest && items.unshift(
            <img className="Changelog-Banner" src={manifest.changelogImage} />
        );

        Settings.set("lastVersion", manifest.version);

        UI.alert(title, items);
    }

    patchSendMessage() {
        const MessageActions = Webpack.getByKeys("sendMessage");

        Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
            const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
            timeRegexMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;

            const dateFormat = Settings
                .get("dateFormat", "dd.MM.yyyy")
                .replace(/[.\/]/g, "[./]").replace("dd", "(\\d{2})")
                .replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");

            const dateRegex = new RegExp(`${dateFormat}`, "gi");
            dateRegexMatch = new RegExp(`${dateFormat}`, "i");

            const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
            const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");

            const relativeRegex = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/gi;
            relativeRegexMatch = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/i;

            msg.content = msg.content
                .replace(TimeDateRegex, x => getUnixTimestamp(x))
                .replace(DateRegexTime, x => getUnixTimestamp(x))
                .replace(timeRegex, x => getUnixTimestamp(x, "t"))
                .replace(dateRegex, x => getUnixTimestamp(x, "d"))
                .replace(relativeRegex, getRelativeTime);
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}