import React from "react";
import { Data, Patcher, Webpack, UI } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import Modal from "./components/modal.jsx";
import "./changelog.scss";

const Settings = Data.load("SETTINGS") || {};

export default class FriendCodes {
    start() {
        this.showChangelog();
        this.patchFriendsTabBar();
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
                <h4 className={`Changelog-Header ${item.type}`}>{item.type}</h4>
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

    patchFriendsTabBar() {
        const TabBar = Webpack.getModule(x => x.Item && x.Header, { searchExports: true });
        const availableTabs = Webpack.getByKeys("ALL", "BLOCKED", "ONLINE", { searchExports: true })
        const { openModal } = Webpack.getModule(x => x.openModal);

        Patcher.after(TabBar.prototype, "render", (_, __, ret) => {
            if (!(ret._owner.memoizedProps?.selectedItem in availableTabs)) return;
            ret.props.children.push(
                <TabBar.Item
                    selectedItem={0}
                    onClick={() => openModal(props => <Modal {...props} />)}
                >
                    Friend Codes
                </TabBar.Item>
            );
        });
    }
}