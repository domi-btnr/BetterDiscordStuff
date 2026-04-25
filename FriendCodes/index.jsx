import { Commands, Patcher, Webpack } from "@api";
import showChangelog from "@common/Changelog";
import ErrorBoundary from "@common/ErrorBoundary";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

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
        const PanelComponent = Webpack.getById(761508)?.V?.Panel;

        Patcher.after(PanelComponent, "render", (_, [{ children, id }]) => {
            if (id !== "ADD_FRIEND") return;
            Patcher.after(children, "type", (_, __, res) => {
                res.props.children.splice(1, 0, (
                    <ErrorBoundary key="FriendCodesPanel" id="FriendCodesPanel">
                        <FriendCodesPanel />
                    </ErrorBoundary>
                ));
            });
        });
    }
}
