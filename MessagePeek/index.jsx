import { Patcher, ReactUtils, Utils, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import Peek from "./components/messagePeek";
import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";

export default class MessagePeek {
    start() {
        if (Settings.get("preloadLimit", 10) > 30)
            Settings.set("preloadLimit", 10);

        showChangelog(manifest);
        this.patchDMs();
        this.patchGuildChannel();
        Styles.load();
    }

    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchDMs() {
        const ChannelContext = React.createContext(null);
        const ChannelWrapper = Webpack.getBySource("activities", "isMultiUserDM", "isMobile");
        const ChannelItem = Webpack.getById("877526");
        const NameWrapper = Webpack.getBySource("AvatarWithText").A;
        const ChannelClasses = Webpack.getByKeys("channel", "decorator");

        Patcher.after(ChannelWrapper, "Ay", (_, __, res) => {
            if (!Settings.get("showInDMs", true)) return;
            Patcher.after(res, "type", (_, [props], res) => {
                return (
                    <ChannelContext.Provider value={props.channel}>
                        {res}
                    </ChannelContext.Provider>
                );
            });
        });

        Patcher.after(ChannelItem, "H", (_, __, res) => {
            if (!Settings.get("showTimestamp", true)) return;
            const channel = React.useContext(ChannelContext);
            if (!channel) return res;

            const children = res.props.children;
            children.splice(children.length - 1, 0, <Peek channelId={channel.id} timestampOnly />);
        });

        Patcher.after(NameWrapper, "render", (_, __, res) => {
            const channel = React.useContext(ChannelContext);
            if (!channel) return res;

            const nameWrapper = Utils.findInTree(res, e => e?.props?.className?.startsWith("content__"), { walkable: ["children", "props"] });
            if (!nameWrapper) return res;
            nameWrapper.props.children.push(
                <Peek channelId={channel.id} />
            );
        });

        // Preload makes an API request
        // It's not a good idea to preload every DM
        // That's why I check if the DM Channel has a message and if it's not already loaded
        // I also limit the amount of DMs to preload to a maximum of 30. Default is 10
        const preload = Webpack.getByKeys("preload", "fetchChannel")?.preload;
        Webpack.getStore("ChannelStore")
            .getSortedPrivateChannels()
            .filter(channel =>
                channel.lastMessageId &&
                !Webpack.getStore("MessageStore")
                    .getMessages(channel.id)?.last()
            )
            .slice(0, Settings.get("preloadLimit", 10))
            .reduce((promise, channel, index) => {
                return promise.then(() => {
                    preload("@me", channel.id);
                    return new Promise(resolve => setTimeout(resolve, 125 + index * 125));
                });
            }, Promise.resolve());

        const ChannelWrapperElement = document.querySelector(`h2 + .${ChannelClasses.channel}`);
        if (ChannelWrapperElement) {
            const ChannelWrapperInstance = ReactUtils.getOwnerInstance(ChannelWrapperElement);
            if (ChannelWrapperInstance) ChannelWrapperInstance.forceUpdate();
        }

    }

    patchGuildChannel() {
        const [ChannelWrapper, Key_CW] = Webpack.getWithKey(Webpack.Filters.byStrings("channel", "unread", ".ALL_MESSAGES"));

        Patcher.after(ChannelWrapper, Key_CW, (_, [{ channel }], res) => {
            if (!Settings.get("showInGuilds", true)) return;
            const nameWrapper = Utils.findInTree(res, e => e?.props?.className?.startsWith("name__"), { walkable: ["children", "props"] });
            if (!nameWrapper) return res;

            nameWrapper.props.children = [
                nameWrapper.props.children,
                <Peek channelId={channel.id} />
            ];

            if (!Settings.get("showTimestamp", true)) return;
            const innerWrapper = Utils.findInTree(res, e => e?.props?.className?.startsWith("linkTop"), { walkable: ["children", "props"] });
            if (!innerWrapper) return res;
            const children = innerWrapper.props.children;
            children.splice(children.length - 1, 0, <Peek channelId={channel.id} timestampOnly />);
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
