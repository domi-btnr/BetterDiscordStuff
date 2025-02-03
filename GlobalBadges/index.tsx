import { Patcher, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import Badges from "./components/globalBadges";
import SettingsPanel from "./components/settings";

export default class GlobalBadges {
    start() {
        showChangelog(manifest);
        this.patchBadges();
        Styles.load();
    }

    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchBadges() {
        const UserContext = React.createContext(null);
        const [ProfileInfoRow, KEY_PIR] = Webpack.getWithKey(Webpack.Filters.byStrings("user", "profileType"));
        const [BadgeList, Key_BL] = Webpack.getWithKey(Webpack.Filters.byStrings("badges", "badgeClassName", ".BADGE"));

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
            res.props.children.unshift(
                <Badges userId={user.id} />
            );
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
