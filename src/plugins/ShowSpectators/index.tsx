import { Logger, Patcher } from "@api";
import showChangelog from "@common/Changelog";
import ErrorBoundary from "@common/ErrorBoundary";
import type { SettingsItem } from "@common/Settings";
import { SettingsPanel } from "@common/Settings";
import manifest from "@manifest";
import Styles from "@styles";
import { isValidElement } from "react";

import { SpectatorsPanel } from "./components/panel";
import { StreamIconTooltip } from "./components/tooltip";
import { AccountPanelSections, StreamIcon } from "./modules/webpack";
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
        if (!StreamIcon) return Logger.error("Failed to find StreamIcon module");

        Patcher.after(...StreamIcon, (_, __, res) => {
            if (!isValidElement(res)) return;
            return <StreamIconTooltip>{res}</StreamIconTooltip>;
        });
    }

    patchPanel() {
        if (!AccountPanelSections) return Logger.error("Failed to find AccountPanelSections module");

        Patcher.after(...AccountPanelSections, (_, args, res) => {
            const [{ value }] = args as [{ value?: string[] }];
            if (!value?.length || !value.every(location => location === "rtc panel")) return;

            const sections = res?.props?.children?.props?.children;
            if (!Array.isArray(sections) || sections.some(section => section?.key === "ShowSpectators")) return;

            sections.unshift(
                <ErrorBoundary key="ShowSpectators" id="ShowSpectators.Panel">
                    <SpectatorsPanel />
                </ErrorBoundary>
            );
        });
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items as SettingsItem[]} />;
    }
}
