import BasePlugin from "@zlibrary/plugin";
import { Patcher, ReactComponents, WebpackModules } from "@zlibrary";
import { openModal } from "@discord/modal";
import React from "react";
import styles from "styles";

import Modal from "./components/modal.jsx";

export default class FriendCodes extends BasePlugin {
    async onStart() {
        styles.inject();
        const TabBar = WebpackModules.getByProps("Item", "Header");
        const FriendsTabBar = await ReactComponents.getComponentByName("TabBar", ".tabBar-ra-EuL");
        Patcher.after(FriendsTabBar.component.prototype, "render", (e, _, returnValue) => {
            // https://github.com/Strencher/BetterDiscordStuff/blob/development/RelationshipCounter/RelationshipCounter.plugin.js#L145
            if (e.props.className && e.props.className.indexOf("tabBar-ra-EuL") !== -1) {
                returnValue.props.children.push(
                    <TabBar.Item selectedItem={0} onClick={() => openModal(props => (<Modal {...props} />))}>Friend Codes</TabBar.Item>
                );
            }
        });
    }

    onStop() {
        styles.remove();
        Patcher.unpatchAll();
    }
}