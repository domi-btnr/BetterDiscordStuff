import React from "react";
import { Patcher, Webpack, UI } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import Badges from "./components/globalBadges";
import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";
import "./changelog.scss";

export default class GlobalBadges {
    start() {
        this.showChangelog();
        this.patchBadges();
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

    patchBadges() {
        const UserContext = React.createContext(null);
        const [ProfileInfoRow, KEY_PIR] = Webpack.getWithKey(Webpack.Filters.byStrings("user", "profileType"));
        const [BadgeList, Key_BL] = Webpack.getWithKey(Webpack.Filters.byStrings("badges", "badgeClassName"));
        
        Patcher.after(ProfileInfoRow, KEY_PIR, (_, [props], res) => {
            return (
                <UserContext.Provider value={props["user"]}>
                    {res}
                </UserContext.Provider>
              );
        });

        Patcher.after(BadgeList, Key_BL, (_, __, res) => {
            const user = React.useContext(UserContext);
            if (!user) return;
            res.props.children.push(
                <Badges userId={user.id} />
            );
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}