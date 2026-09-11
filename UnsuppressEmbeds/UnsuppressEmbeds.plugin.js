/**
 * @name UnsuppressEmbeds
 * @version 1.0.1
 * @description Allows you to unsuppress embeds in messages
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/UnsuppressEmbeds
 */

'use strict';

/* @manifest */
const manifest = {
    "$schema": "../common/Schemas/manifest.schema.json",
    "name": "UnsuppressEmbeds",
    "version": "1.0.1",
    "description": "Allows you to unsuppress embeds in messages",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/UnsuppressEmbeds"
};

/* @api */
const {
    Components,
    ContextMenu,
    Data,
    UI,
    Utils,
    Webpack
} = new BdApi(manifest.name);

/* react */
var React = BdApi.React;

/* ../common/Changelog/footer.tsx */
const {
    Text
} = Components;

function Footer({
    manifest
}) {
    if (!manifest.invite && !manifest.source) return null;
    let issuesUrl;
    if (manifest.source) {
        const url = new URL(manifest.source);
        const [, owner, repo] = url.pathname.split("/");
        url.pathname = `/${owner}/${repo}/issues`;
        issuesUrl = url.toString();
    }
    return React.createElement(Text, null, "Need support?", " ", manifest.invite && React.createElement(React.Fragment, null, "Join the", " ", React.createElement("a", {
        onClick: () => UI.showInviteModal(manifest.invite),
        style: {
            textDecoration: "underline"
        }
    }, "Discord Server"), manifest.source && " or "), manifest.source && React.createElement(React.Fragment, null, "Check for Issues on", " ", React.createElement("a", {
        href: issuesUrl,
        target: "_blank",
        rel: "noreferrer",
        style: {
            textDecoration: "underline"
        }
    }, "GitHub")));
}

/* ../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog) return;
    const {
        date,
        title,
        subtitle,
        ...changelog
    } = manifest.changelog;
    if (!changelog.changes?.length && !changelog.blurb && !changelog.video && !changelog.banner) return;
    const i18n = Webpack.getByKeys("getLocale");
    const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog,
        onClose: () => Data.save("lastVersion", manifest.version),
        footer: React.createElement(Footer, {
            manifest
        })
    });
}

/* components/icons.tsx */
function ImageVisible(props) {
    return React.createElement("svg", {
        ...props,
        className: Utils.className(props.className, "image-visible"),
        viewBox: "0 0 24 24"
    }, React.createElement(
        "path", {
            fill: "currentColor",
            d: "M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm1-2h12l-3.75-5-3 4L9 13Zm-1 2V5v14Z"
        }
    ));
}

function ImageInvisible(props) {
    return React.createElement("svg", {
        ...props,
        className: Utils.className(props.className, "image-invisible"),
        viewBox: "0 0 24 24"
    }, React.createElement(
        "path", {
            fill: "currentColor",
            d: "m21 18.15-2-2V5H7.85l-2-2H19q.825 0 1.413.587Q21 4.175 21 5Zm-1.2 4.45L18.2 21H5q-.825 0-1.413-.587Q3 19.825 3 19V5.8L1.4 4.2l1.4-1.4 18.4 18.4ZM6 17l3-4 2.25 3 .825-1.1L5 7.825V19h11.175l-2-2Zm7.425-6.425ZM10.6 13.4Z"
        }
    ));
}

/* modules/utils.ts */
function findGroupById(res, id) {
    if (!res) return null;
    let children = res.props?.children;
    if (!children) return null;
    if (!Array.isArray(children)) children = [children];
    if (children.some((child) => child && typeof child === "object" && "props" in child && child.props?.id === id))
        return res;
    for (const child of children)
        if (child && typeof child === "object") {
            const found = findGroupById(child, id);
            if (found) return found;
        }
    return null;
}

/* index.tsx */
let unpatchContextMenu;
const EMBED_SUPPRESSED = 1 << 2;
class UnsuppressEmbeds {
    start() {
        showChangelog(manifest);
        this.patchMessageContextMenu();
    }
    stop() {
        unpatchContextMenu?.();
    }
    patchMessageContextMenu() {
        const Endpoints = Webpack.getModule((m) => typeof m?.MESSAGES === "function", {
            searchExports: true
        });
        const RestAPI2 = Webpack.getModule((m) => typeof m === "object" && m.del && m.put, {
            searchExports: true
        });
        const PermissionsBits2 = Webpack.getModule((m) => m?.EMBED_LINKS, {
            searchExports: true
        });
        const PermissionStore2 = Webpack.getStore("PermissionStore");
        const UserStore2 = Webpack.getStore("UserStore");
        unpatchContextMenu = ContextMenu.patch("message", (res, props) => {
            const {
                channel,
                message
            } = props;
            const {
                author,
                messageSnapshots,
                embeds,
                flags,
                id: messageId
            } = message;
            const isEmbedSuppressed = (flags & EMBED_SUPPRESSED) !== 0;
            const hasEmbedsInSnapshots = messageSnapshots.some((snapshot) => snapshot?.message.embeds.length);
            if (!isEmbedSuppressed && !embeds.length && !hasEmbedsInSnapshots) return;
            const hasEmbedPerms = channel.isPrivate() || !!(PermissionStore2.getChannelPermissions({
                id: channel.id
            }) & PermissionsBits2.EMBED_LINKS);
            if (author.id === UserStore2.getCurrentUser().id && !hasEmbedPerms) return;
            const menuGroup = findGroupById(res, "delete")?.props.children;
            if (!menuGroup) return;
            const deleteIndex = menuGroup.findIndex((i) => i?.props?.id === "delete");
            if (deleteIndex < 0) return;
            menuGroup.splice(
                deleteIndex - 1,
                0,
                React.createElement(
                    ContextMenu.Item, {
                        id: "unsuppress-embeds",
                        key: "unsuppress-embeds",
                        label: isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds",
                        color: isEmbedSuppressed ? void 0 : "danger",
                        leadingAccessory: {
                            type: "icon",
                            icon: isEmbedSuppressed ? ImageVisible : ImageInvisible
                        },
                        action: () => RestAPI2.patch({
                            url: Endpoints.MESSAGE(channel.id, messageId),
                            body: {
                                flags: isEmbedSuppressed ? flags & ~EMBED_SUPPRESSED : flags | EMBED_SUPPRESSED
                            }
                        })
                    }
                )
            );
        });
    }
}

module.exports = UnsuppressEmbeds;