import { ContextMenu, Webpack } from "@api";
import manifest from "@manifest";
import Styles from "@styles";
import React from "react";

import showChangelog from "../common/Changelog";
import { ImageInvisible, ImageVisible } from "./components/icons";
import { findGroupById } from "./modules/utils";

let unpatchContextMenu: () => void;
const EMBED_SUPPRESSED = 1 << 2;

export default class UnsuppressEmbeds {
    start() {
        showChangelog(manifest);
        this.patchMessageContextMenu();
        Styles.load();
    }

    stop() {
        unpatchContextMenu?.();
        Styles.unload();
    }

    patchMessageContextMenu() {
        const Endpoints = Webpack.getModule(m => typeof m?.MESSAGES === "function", { searchExports: true });
        const PermissionsBits = Webpack.getModule(m => m?.EMBED_LINKS, { searchExports: true });
        const PermissionStore = Webpack.getStore("PermissionStore");
        const RestAPI = Webpack.getModule(m => typeof m === "object" && m.del && m.put, { searchExports: true });
        const UserStore = Webpack.getStore("UserStore");

        unpatchContextMenu = ContextMenu.patch("message", (res, { channel, message: { author, messageSnapshots, embeds, flags, id: messageId } }) => {
            const isEmbedSuppressed = (flags & EMBED_SUPPRESSED) !== 0;
            const hasEmbedsInSnapshots = messageSnapshots.some(
                (snapshot: any) => snapshot?.message.embeds.length
            );

            if (!isEmbedSuppressed && !embeds.length && !hasEmbedsInSnapshots) return;

            const hasEmbedPerms = channel.isPrivate() || !!(PermissionStore.getChannelPermissions({ id: channel.id }) & PermissionsBits.EMBED_LINKS);
            if (author.id === UserStore.getCurrentUser().id && !hasEmbedPerms) return;

            const menuGroup = findGroupById(res, "delete")?.props?.children;
            const deleteIndex = menuGroup?.findIndex(i => i?.props?.id === "delete");
            if (!menuGroup || !deleteIndex) return;

            menuGroup.splice(deleteIndex - 1, 0, (
                // @ts-ignore
                <ContextMenu.Item
                    id="unsuppress-embeds"
                    key="unsuppress-embeds"
                    label={isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds"}
                    color={isEmbedSuppressed ? undefined : "danger"}
                    icon={isEmbedSuppressed ? ImageVisible : ImageInvisible}
                    action={() =>
                        RestAPI.patch({
                            url: Endpoints.MESSAGE(channel.id, messageId),
                            body: { flags: isEmbedSuppressed ? flags & ~EMBED_SUPPRESSED : flags | EMBED_SUPPRESSED }
                        })
                    }
                />
            ));
        });
    }
}
