import { Logger, Patcher, Utils } from "@api";
import showChangelog from "@common/Changelog";
import type { SettingsItem } from "@common/Settings";
import { Settings, SettingsPanel } from "@common/Settings";
import { rerenderComponent } from "@common/Utils";
import manifest from "@manifest";
import Styles from "@styles";
import type { ModuleWithKey } from "@typings";
import type { Channel } from "@vencord/discord-types";

import Preview from "./components/preview";
import styles from "./components/preview.scss";
import Timestamp from "./components/timestamp";
import { findByClassName, findInTree, isWrapped, patchRender } from "./modules/elements";
import { preloadChannels } from "./modules/messages";
import { startTracking, stopTracking } from "./modules/rowHeight";
import { ChannelStore, DMRow, getGuildChannelRow, GuildChannelStore, SelectedGuildStore } from "./modules/webpack";
import SettingsItems from "./settings.json";

const MAX_PRELOAD = 30;

export default class MessagePeek {
    controller?: AbortController;
    unpatchDMs?: () => void;
    unpatchGuildChannels?: () => void;

    async start() {
        if (Settings.get("preloadLimit", 10) > MAX_PRELOAD) Settings.set("preloadLimit", 10);

        Styles.load();
        showChangelog(manifest);
        this.controller = new AbortController();
        startTracking();
        this.unpatchDMs = this.patchDMs(this.controller.signal);
        this.unpatchGuildChannels = await this.patchGuildChannels(this.controller.signal);
    }

    stop() {
        this.controller?.abort();
        this.unpatchDMs?.();
        this.unpatchGuildChannels?.();
        Patcher.unpatchAll();
        stopTracking();
        Styles.unload();
    }

    /**
     * Patches a row component and re-renders the rows that are already on screen.
     * @returns Removes the patch again and re-renders the rows.
     */
    patchRows(row: ModuleWithKey, callback: Parameters<typeof Patcher.after>[2]) {
        const unpatch = Patcher.after(...row, callback);
        rerenderComponent(row);

        return () => {
            unpatch?.();
            rerenderComponent(row);
        };
    }

    patchDMs(signal: AbortSignal) {
        if (!DMRow) {
            Logger.error("Failed to find DMRow");
            return;
        }

        const unpatch = this.patchRows(DMRow, (_, args, res) => {
            const [{ channel }] = args as [{ channel: Channel }];

            patchRender(res, inner => {
                if (signal.aborted) return;
                const row = findInTree(
                    inner,
                    node =>
                        typeof node?.type === "function"
                        && !isWrapped(node)
                        && "id" in node.props
                        && "children" in node.props
                );

                patchRender(row, rowRes => {
                    const name = findInTree(rowRes, node => node?.type?.displayName === "AvatarWithText");
                    if (name) {
                        name.props.innerClassName = Utils.className(name.props.innerClassName, styles.messagePeekDm);
                        name.props.subText = (
                            <>
                                {name.props.subText}
                                <Preview channelId={channel.id} location="dm" />
                            </>
                        );
                    }

                    const icons = findByClassName(rowRes, "iconsContainer");
                    if (icons) {
                        icons.props.children = (
                            <>
                                <Timestamp channelId={channel.id} location="dm" />
                                {icons.props.children}
                            </>
                        );
                    }
                });
            });
        });

        preloadChannels("@me", ChannelStore.getSortedPrivateChannels(), signal);
        return unpatch;
    }

    async patchGuildChannels(signal: AbortSignal) {
        const GuildChannelRow = await getGuildChannelRow(signal);
        if (!GuildChannelRow || signal.aborted) return;

        const unpatch = this.patchRows(GuildChannelRow, (_, args, res) => {
            const [{ channel }] = args as [{ channel: Channel }];
            const name = findByClassName(res, "name__");
            if (name) {
                name.props.children = (
                    <>
                        {name.props.children}
                        <Preview channelId={channel.id} location="guild" />
                    </>
                );
            }

            const linkTop = findByClassName(res, "linkTop")?.props.children;
            if (Array.isArray(linkTop)) {
                linkTop.splice(linkTop.length - 1, 0, <Timestamp channelId={channel.id} location="guild" />);
            }
        });

        const guildId = SelectedGuildStore.getGuildId();
        if (guildId) {
            const channels = GuildChannelStore.getSelectableChannels(guildId).map(({ channel }) => channel);
            channels.sort((a, b) => (BigInt(b.lastMessageId ?? 0) > BigInt(a.lastMessageId ?? 0) ? 1 : -1));
            preloadChannels(guildId, channels, signal);
        }
        return unpatch;
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items as SettingsItem[]} />;
    }
}
