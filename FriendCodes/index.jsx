import { Patcher, Webpack } from "@api";
import React from "react";
import Styles from "@styles";

import Modal from "./components/modal.jsx";

export default class FriendCodes {
    start() {
        this.patchFriendsTabBar();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
    }

    patchFriendsTabBar() {
        const TabBar = Webpack.getModule(x => x.Item && x.Header, { searchExports: true });
        const { openModal } = Webpack.getModule(x => x.openModal);

        Patcher.after(TabBar.prototype, "render", (_, __, ret) => {
            ret.props.children.push(
                <TabBar.Item
                    selectedItem={0}
                    onClick={() => openModal(props => <Modal {...props} />)}
                >
                    Friend Codes
                </TabBar.Item>
            );
        });
    }

    onStop() {
        Patcher.unpatchAll();
        Styles.unload();
    }
}