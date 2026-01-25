import { Components, Patcher, Utils, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import SettingsPanel from "./components/settings";
import { SpectatorsPanel, SpectatorsTooltip } from "./components/spectators";

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

        Patcher.after(StreamIcon, "A", (_, __, res) => {
            const children = res.props.children;
            res.props.children = [
                <Components.Tooltip
                    text={<SpectatorsTooltip />}
                >
                    {props => children.map(child => React.cloneElement(child, props))}
                </Components.Tooltip>
            ];
        });
    }

    patchPanel() {
        const AccountPanelSections = Webpack.getById("688810");

        const unpatch = Patcher.after(AccountPanelSections, "f5", (_, __, res) => {
            if (!res.props.value.every(v => v === "rtc panel")) return;
            const voiceSection = Utils.findInTree(res, e => e?.props?.canGoLive, { walkable: ["children", "props"] });
            if (!voiceSection) return;
            unpatch();
            Patcher.after(voiceSection.type.prototype, "render", (_, __, res) => {
                if (!res) return;
                const original = res.props.children();
                res.props.children = () => {
                    return (
                        <>
                            <SpectatorsPanel />
                            {original}
                        </>
                    );
                };
            });
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
