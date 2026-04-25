import { Patcher, ReactUtils, Utils, Webpack } from "@api";
import { Settings, SettingsPanel } from "@common/Settings";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import Peek from "./components/messagePeek";
import SettingsItems from "./settings.json";

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

    async patchDMs() {
        const ChannelContext = React.createContext(null);
        const ChannelWrapper = await Webpack.waitForModule(Webpack.Filters.bySource("location:\"PrivateChannel\",", "isMobile"));
        const NameWrapper = (await Webpack.waitForModule(Webpack.Filters.bySource("AvatarWithText"))).A;
        const ChannelClasses = await Webpack.waitForModule(Webpack.Filters.byKeys("channel", "decorator"));

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

        // Patcher.after(ChannelWrapper, "th", (_, __, res) => {
        //     console.log(__);
        //     console.log(res);
        //     if (!Settings.get("showTimestamp", true)) return;
        //     const channel = React.useContext(ChannelContext);
        //     if (!channel) return res;

        //     const children = res.props.children;
        //     children.splice(children.length - 1, 0, <Peek channelId={channel.id} timestampOnly />);
        // });

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

    async patchGuildChannel() {
        const ChannelWrapper = await Webpack.waitForModule(Webpack.Filters.byComponentType(Webpack.Filters.byStrings("channel", "unread", ".ALL_MESSAGES")));

        Patcher.after(ChannelWrapper, "render", (_, [{ channel }], res) => {
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
        return <SettingsPanel items={SettingsItems.items} />;
    }
}
