import React from "react";
import { Data, Patcher, Webpack, UI } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";
import { getUnixTimestamp } from "./modules/utils";
import "./changelog.scss";

export let timeRegexMatch, dateRegexMatch;

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
                <h4 className={`Changelog-Header ${item.type}`}>{item.type}</h4>
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
            const timeMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
            timeRegexMatch = timeMatch;

            const dateFormat = Settings.get("dateFormat", "dd.MM.yyyy").replace(/[.\/]/g, "[./]").replace("dd", "(\\d{2})").replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");
            const dateRegex = new RegExp(`${dateFormat}`, "gi");
            const dateMatch = new RegExp(`${dateFormat}`, "i");
            dateRegexMatch = dateMatch;

            const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
            const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");

            if (msg.content.search(TimeDateRegex) !== -1) {
                msg.content = msg.content.replace(TimeDateRegex, x => getUnixTimestamp(x));
            }
            if (msg.content.search(DateRegexTime) !== -1) {
                msg.content = msg.content.replace(DateRegexTime, x => getUnixTimestamp(x));
            }
            if (msg.content.search(timeRegex) !== -1) {
                msg.content = msg.content.replace(timeRegex, x => getUnixTimestamp(x, "t"));
            }
            if (msg.content.search(dateRegex) !== -1) {
                msg.content = msg.content.replace(dateRegex, x => getUnixTimestamp(x, "d"));
            }
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}