import { Logger, Patcher, ReactUtils, Utils } from "@api";
import showChangelog from "@common/Changelog";
import type { SettingsItem } from "@common/Settings";
import { Settings, SettingsPanel } from "@common/Settings";
import manifest from "@manifest";
import Styles from "@styles";
import type { Channel } from "@vencord/discord-types";

import Preview from "./components/preview";
import styles from "./components/preview.scss";
import Timestamp from "./components/timestamp";
import { findByClassName, findInTree, isWrapped, patchRender } from "./modules/elements";
import { preloadChannels } from "./modules/messages";
import { startTracking, stopTracking } from "./modules/rowHeight";
import {
    ChannelClasses,
    ChannelStore,
    DMRow,
    getGuildChannelRow,
    GuildChannelStore,
    SelectedGuildStore
} from "./modules/webpack";
import SettingsItems from "./settings.json";

const MAX_PRELOAD = 30;

export default class MessagePeek {
    controller?: AbortController;

    start() {
        if (Settings.get("preloadLimit", 10) > MAX_PRELOAD) Settings.set("preloadLimit", 10);

        Styles.load();
        showChangelog(manifest);
        this.controller = new AbortController();
        startTracking();
        this.patchDMs(this.controller.signal);
        this.patchGuildChannels(this.controller.signal);
    }

    stop() {
        this.controller?.abort();
        Patcher.unpatchAll();
        stopTracking();
        this.rerenderDMList();
        Styles.unload();
    }

    rerenderDMList() {
        const DMList = ChannelClasses && document.querySelector<HTMLElement>(`h2 + .${ChannelClasses.channel}`);
        if (DMList) ReactUtils.getOwnerInstance(DMList)?.forceUpdate();
    }

    patchDMs(signal: AbortSignal) {
        if (!DMRow) return Logger.error("Failed to find DMRow");

        Patcher.after(...DMRow, (_, args, res) => {
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
        this.rerenderDMList();
    }

    async patchGuildChannels(signal: AbortSignal) {
        const GuildChannelRow = await getGuildChannelRow(signal);
        if (!GuildChannelRow || signal.aborted) return;

        Patcher.after(...GuildChannelRow, (_, args, res) => {
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
        if (!guildId) return;
        const channels = GuildChannelStore.getSelectableChannels(guildId).map(({ channel }) => channel);
        channels.sort((a, b) => (BigInt(b.lastMessageId ?? 0) > BigInt(a.lastMessageId ?? 0) ? 1 : -1));
        preloadChannels(guildId, channels, signal);
    }

    getSettingsPanel() {
        return <SettingsPanel items={SettingsItems.items as SettingsItem[]} />;
    }
}
