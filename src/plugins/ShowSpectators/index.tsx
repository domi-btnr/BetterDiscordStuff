import { Logger, Patcher } from "@api";
import showChangelog from "@common/Changelog";
import ErrorBoundary from "@common/ErrorBoundary";
import type { SettingsItem } from "@common/Settings";
import { SettingsPanel } from "@common/Settings";
import { rerenderComponent } from "@common/Utils";
import manifest from "@manifest";
import Styles from "@styles";
import { cloneElement, isValidElement } from "react";

import { SpectatorsPanel } from "./components/panel";
import { StreamIconTooltip } from "./components/tooltip";
import { AccountPanelSections, SelectedChannelStore, StreamIcon } from "./modules/webpack";
import SettingsItems from "./settings.json";

const isRtcPanel = (value?: string[]) => !!value?.length && value.every(location => location === "rtc panel");

export default class ShowSpectators {
    unpatchPanel?: () => void;

    start() {
        Styles.load();
        showChangelog(manifest);
        this.patchStreamIcon();
        this.unpatchPanel = this.patchPanel();
    }

    stop() {
        this.unpatchPanel?.();
        Patcher.unpatchAll();
        Styles.unload();
    }

    /** The voice call panel doesn't re-render on its own, so when already in a call it needs a push to (un)patch. */
    rerenderPanel() {
        if (!AccountPanelSections || !SelectedChannelStore.getVoiceChannelId()) return;
        rerenderComponent(AccountPanelSections, fiber => isRtcPanel(fiber.memoizedProps?.value));
    }

    patchStreamIcon() {
        if (!StreamIcon) return Logger.error("Failed to find StreamIcon module");

        Patcher.after(...StreamIcon, (_, __, res) => {
            if (!isValidElement(res)) return;
            return <StreamIconTooltip>{res}</StreamIconTooltip>;
        });
    }

    patchPanel() {
        if (!AccountPanelSections) {
            Logger.error("Failed to find AccountPanelSections module");
            return;
        }

        const unpatch = Patcher.after(...AccountPanelSections, (_, args, res) => {
            const [{ value }] = args as [{ value?: string[] }];
            if (!isRtcPanel(value)) return;

            const container = res?.props?.children;
            const sections = container?.props?.children;
            if (!isValidElement(container) || !Array.isArray(sections)) return;

            res.props.children = cloneElement(
                container,
                undefined,
                <ErrorBoundary key="ShowSpectators" id="ShowSpectators.Panel">
                    <SpectatorsPanel />
                </ErrorBoundary>,
                ...sections
            );
        });
        this.rerenderPanel();

        return () => {
            unpatch?.();
            this.rerenderPanel();
        };
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items as SettingsItem[]} />;
    }
}
