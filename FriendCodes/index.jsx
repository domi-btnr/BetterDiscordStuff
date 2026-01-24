import { Commands, Patcher, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import ErrorBoundary from "../common/ErrorBoundary";
import PluginCommands from "./commands";
import FriendCodesPanel from "./components/panel.jsx";

export default class FriendCodes {
    start() {
        showChangelog(manifest);
        this.patchAddFriendsPanel();
        Styles.load();

        PluginCommands
            .forEach(cmd => Commands.register(cmd));
    }
    stop() {
        Commands.unregisterAll();
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchAddFriendsPanel() {
        const AddFriendsPage = Webpack.getBySource(".Heading", "heading-lg/semibold", ".w5uwoI");

        Patcher.after(AddFriendsPage, "A", (_, __, res) => {
            res.props.children.splice(1, 0, (
                <ErrorBoundary key="FriendCodesPanel" id="FriendCodesPanel">
                    <FriendCodesPanel />
                </ErrorBoundary>
            ));
        });
    }
}
