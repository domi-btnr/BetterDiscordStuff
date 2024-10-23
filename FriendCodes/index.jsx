import React from "react";
import { Data, Patcher, Webpack, UI } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import FriendCodesPanel from "./components/panel.jsx";
import "./changelog.scss";

const Settings = Data.load("SETTINGS") || {};

export default class FriendCodes {
    start() {
        this.showChangelog();
        this.patchAddFriendsPanel();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    showChangelog() {
        if (Settings.lastVersion === manifest.version) return;

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

        Settings.lastVersion = manifest.version;
        Data.save("SETTINGS", Settings);

        UI.alert(title, items);
    }

    patchAddFriendsPanel() {
        const  [Module, Key] = Webpack.getWithKey(Webpack.Filters.byStrings(".Fragment", ".emptyState", ".ADD_FRIEND"));

        Patcher.after(Module, Key, (_, __, res) => {
            res.props.children.splice(1, 0, <FriendCodesPanel />);
        });
    }
}