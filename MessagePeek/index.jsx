import React from "react";
import { Patcher, ReactUtils, Webpack, UI } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import Peek from "./components/messagePeek";
import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";
import "./changelog.scss";

export default class MessagePeek {
    start() {
        if (Settings.get("preloadLimit", 10) > 30)
            Settings.set("preloadLimit", 10);

        this.showChangelog();
        this.patchDMs();
        Styles.load();
    }

    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    showChangelog() {
        if (
            !manifest.changelog.length ||
            Settings.get("lastVersion") === manifest.version
        ) return;

        const i18n = Webpack.getByKeys("getLocale");
        const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        const title = (
            <div className="Changelog-Title-Wrapper">
                <h1>What's New - {manifest.name}</h1>
                <div>{formatter.format(new Date(manifest.changelogDate))} - v{manifest.version}</div>
            </div>
        )

        const items = manifest.changelog.map(item => (
            <div className="Changelog-Item">
                <h4 className={`Changelog-Header ${item.type}`}>{item.title}</h4>
                {item.items.map(item => (
                    <span>{item}</span>
                ))}
            </div>
        ));

        "changelogImage" in manifest && items.unshift(
            <img className="Changelog-Banner" src={manifest.changelogImage} />
        );

        Settings.set("lastVersion", manifest.version);

        UI.alert(title, items);
    }

    patchDMs() {
        const ChannelContext = React.createContext(null);
        const [ChannelWrapper, Key_CW] = Webpack.getWithKey(Webpack.Filters.byStrings("isGDMFacepileEnabled"));
        const [NameWrapper, Key_NW] = Webpack.getWithKey(x => x.toString().includes(".nameAndDecorators") && !x.toString().includes("FocusRing"));
        const ChannelClasses = Webpack.getByKeys("channel", "decorator");

        Patcher.after(ChannelWrapper, Key_CW, (_, __, res) => {
            if (!Settings.get("showInDMs", true)) return;
            Patcher.after(res, "type", (_, [props], res) => {
                return (
                    <ChannelContext.Provider value={props.channel}>
                        {res}
                    </ChannelContext.Provider>
                );
            });
        });

        Patcher.after(NameWrapper, Key_NW, (_, __, res) => {
            const channel = React.useContext(ChannelContext);
            if (!channel) return res;

            res.props.children[1].props.children.push(
                <Peek channelId={channel.id} />
            )
        });

        // Preload makes an API request
        // It's not a good idea to preload every DM
        // That's why I check if the DM Channel has a message and if it's not already loaded
        // I also limit the amount of DMs to preload to a maximum of 30. Default is 10
        Webpack.getStore("ChannelStore")
            .getSortedPrivateChannels()
            .filter(channel => 
                channel.lastMessageId &&
                !Webpack.getStore("MessageStore")
                    .getMessages(channel.id)?.last()
            )
            .slice(0, Settings.get("preloadLimit", 10))
            .forEach(channel => Webpack.getByKeys("preload")?.preload("@me", channel.id));

        const ChannelWrapperElement = document.querySelector(`h2 + .${ChannelClasses.channel}`);
        if (ChannelWrapperElement) {
            const ChannelWrapperInstance = ReactUtils.getOwnerInstance(ChannelWrapperElement);
            if (ChannelWrapperInstance) ChannelWrapperInstance.forceUpdate();
        }

    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}