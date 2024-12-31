import React from "react";
import { Patcher, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";

import showChangelog from "../common/Changelog";
import ErrorBoundary from "../common/ErrorBoundary";

import FriendCodesPanel from "./components/panel.jsx";

export default class FriendCodes {
    start() {
        showChangelog(manifest);
        this.patchAddFriendsPanel();
        Styles.load();
    }
    stop() {
        Patcher.unpatchAll();
        Styles.unload();
    }

    patchAddFriendsPanel() {
        const [Module, Key] = Webpack.getWithKey(Webpack.Filters.byStrings(".Fragment", ".emptyState", ".ADD_FRIEND"));

        Patcher.after(Module, Key, (_, __, res) => {
            res.props.children.splice(1, 0, (
                <ErrorBoundary key="FriendCodesPanel" id="FriendCodesPanel">
                    <FriendCodesPanel />
                </ErrorBoundary>
            ));
        });
    }
}