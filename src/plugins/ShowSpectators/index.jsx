import { Components, Logger, Patcher, Webpack } from "@api";
import showChangelog from "@common/Changelog";
import { SettingsPanel } from "@common/Settings";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import { SpectatorsPanel, SpectatorsTooltip } from "./components/spectators";
import SettingsItems from "./settings.json";

export default class ShowSpectators {
    start() {
        Styles.load();
        showChangelog(manifest);
        this.patchStreamIcon();
        this.patchPanel();
    }

    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchStreamIcon() {
        const StreamIcon = Webpack.getBySource(".STATUS_SCREENSHARE");
        if (!StreamIcon) return Logger.error("Failed to find StreamIcon module");

        Patcher.after(StreamIcon, "A", (_, __, res) => {
            const children = res.props.children;
            res.props.children = [
                <Components.Tooltip text={<SpectatorsTooltip />}>
                    {props => children.map(child => React.cloneElement(child, props))}
                </Components.Tooltip>
            ];
        });
    }

    patchPanel() {
        const AccountPanelSections = Webpack.getById("688810");
        if (!AccountPanelSections) return Logger.error("Failed to find AccountPanelSections module");

        Patcher.after(AccountPanelSections, "f5", (_, __, res) => {
            if (!res.props.value.every(v => v === "rtc panel")) return;
            res.props.children.props.children.unshift(<SpectatorsPanel />);
        });
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items} />;
    }
}
