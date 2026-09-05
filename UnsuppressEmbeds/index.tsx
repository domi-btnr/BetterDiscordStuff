import { ContextMenu, Webpack } from "@api";
import showChangelog from "@common/Changelog";
import manifest from "@manifest";
import Styles from "@styles";
import {
    Channel,
    Constants,
    Message,
    PermissionsBits,
    PermissionStore,
    RestAPI,
    UserStore
} from "@vencord/discord-types";
import React from "react";

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
        const Endpoints: Constants["Endpoints"] = Webpack.getModule(m => typeof m?.MESSAGES === "function", {
            searchExports: true
        })!;
        const RestAPI: RestAPI = Webpack.getModule(m => typeof m === "object" && m.del && m.put, {
            searchExports: true
        })!;

        const PermissionsBits: PermissionsBits = Webpack.getModule(m => m?.EMBED_LINKS, { searchExports: true })!;
        const PermissionStore = Webpack.getStore("PermissionStore")! as unknown as PermissionStore;

        const UserStore = Webpack.getStore("UserStore")! as unknown as UserStore;

        unpatchContextMenu = ContextMenu.patch("message", (res, props) => {
            const { channel, message } = props as typeof props & { channel: Channel; message: Message };
            const { author, messageSnapshots, embeds, flags, id: messageId } = message;

            const isEmbedSuppressed = (flags & EMBED_SUPPRESSED) !== 0;
            const hasEmbedsInSnapshots = messageSnapshots.some(snapshot => snapshot?.message.embeds.length);

            if (!isEmbedSuppressed && !embeds.length && !hasEmbedsInSnapshots) return;

            const hasEmbedPerms =
                channel.isPrivate() ||
                !!(PermissionStore.getChannelPermissions({ id: channel.id }) & PermissionsBits.EMBED_LINKS);
            if (author.id === UserStore.getCurrentUser().id && !hasEmbedPerms) return;

            const menuGroup = findGroupById(res, "delete")?.props.children;
            if (!menuGroup) return;

            const deleteIndex = menuGroup.findIndex(i => i?.props?.id === "delete");
            if (deleteIndex < 0) return;

            menuGroup.splice(
                deleteIndex - 1,
                0,
                <ContextMenu.Item
                    id="unsuppress-embeds"
                    key="unsuppress-embeds"
                    label={isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds"}
                    color={isEmbedSuppressed ? undefined : "danger"}
                    leadingAccessory={{ type: "icon", icon: isEmbedSuppressed ? ImageVisible : ImageInvisible }}
                    action={() =>
                        RestAPI.patch({
                            url: Endpoints.MESSAGE(channel.id, messageId),
                            body: {
                                flags: isEmbedSuppressed ? flags & ~EMBED_SUPPRESSED : flags | EMBED_SUPPRESSED
                            }
                        })
                    }
                />
            );
        });
    }
}
