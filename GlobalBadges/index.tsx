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
        const [BadgeList, Key_BL] = Webpack.getWithKey(Webpack.Filters.byStrings("badges", "badgeClassName", ".BADGE"));

        Patcher.after(BadgeList, Key_BL, (_, [{ displayProfile }], res) => {
            if (!displayProfile.userId) return;
            res.props.children.unshift(
                <Badges userId={displayProfile.userId} />
            );
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
