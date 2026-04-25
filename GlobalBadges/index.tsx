import { Patcher, Webpack } from "@api";
import showChangelog from "@common/Changelog";
import type { SettingsItem } from "@common/Settings";
import { SettingsPanel } from "@common/Settings";
import manifest from "@manifest";
import Styles from "@styles";
import { DisplayProfile } from "@vencord/discord-types";
import React from "react";

import Badges from "./components/globalBadges";
import SettingsItems from "./settings.json";

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

        Patcher.after(BadgeList, Key_BL, (_, args, res) => {
            const [{ displayProfile }] = args as [{ displayProfile: DisplayProfile }];
            if (!displayProfile?.userId) return;
            res.props.children.unshift(<Badges userId={displayProfile.userId} />);
        });
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items as SettingsItem[]} />;
    }
}
