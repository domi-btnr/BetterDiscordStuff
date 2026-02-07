import { ContextMenu } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import Popout from "./components/Popout";
import { Dispatcher, PopoutWindowStore } from "./modules/shared";
import { findGroupById, generateStreamKey } from "./modules/utils";

let unpatchContextMenu;

export default class MultiStreamPopouts {
    start() {
        showChangelog(manifest);
        this.patchStreamTileContextMenu();
        Dispatcher.subscribe("STREAM_CLOSE", this.eventListener);
        Styles.load();
    }

    stop() {
        unpatchContextMenu?.();
        Dispatcher.unsubscribe("STREAM_CLOSE", this.eventListener);
        Styles.unload();
    }

    eventListener({ streamKey }) {
        const windowKey = `DISCORD_STREAM_POPUP_${streamKey}`;
        const window = PopoutWindowStore.getWindowOpen(windowKey);
        if (window) PopoutWindowStore.unmountWindow(windowKey);
    }

    patchStreamTileContextMenu() {
        unpatchContextMenu = ContextMenu.patch("stream-context", (res, { stream }) => {
            const menuGroup = (findGroupById(res, "user-volume") || findGroupById(res, "stream-settings-audio-enable"))?.props?.children;
            if (!menuGroup) return;

            const windowKey = `DISCORD_STREAM_POPUP_${generateStreamKey(stream)}`;

            menuGroup.push(
                <ContextMenu.Item
                    id="popout-stream"
                    key="popout-stream"
                    label="Popout Stream"
                    action={() => {
                        Dispatcher.dispatch({
                            type: "POPOUT_WINDOW_OPEN",
                            key: windowKey,
                            features: { popout: true },
                            render: () => <Popout windowKey={windowKey} stream={stream} />,
                        });
                    }}
                />,
            );
        });
    }
}
