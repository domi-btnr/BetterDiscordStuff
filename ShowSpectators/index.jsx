import { Components, Patcher, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import SettingsPanel from "./components/settings";
import { SpectatorsPanel, SpectatorsTooltip } from "./components/spectators";
import Settings from "./modules/settings";

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

        Patcher.after(StreamIcon, "Z", (_, __, res) => {
            const children = res.props.children;
            res.props.children = [(
                <Components.Tooltip
                    text={<SpectatorsTooltip />}
                >
                    {props => children.map(child => React.cloneElement(child, props))}
                </Components.Tooltip>
            )];
        });
    }

    patchPanel() {
        const StreamPanel = Webpack.getBySource("SharingPrivacyPopout");

        Patcher.after(StreamPanel, "j", (_, __, res) => {
            if (!Settings.get("showPanel", true)) return;
            res.props.children = [
                res.props.children,
                <SpectatorsPanel />
            ];
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
