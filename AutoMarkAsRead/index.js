import BasePlugin from "@zlibrary/plugin";
import { Patcher, ContextMenu, DiscordModules } from "@zlibrary";

const AckUtils = BdApi.findModuleByProps("ack");
const GuildFolders = BdApi.findModuleByProps("getGuildsTree").getCompatibleGuildFolders()
export default class AutoMarkAsRead extends BasePlugin {
    onStart() {
        this.patchFolderContextMenu();
        this.patchGuildContextMenu();
        this.patchChannelContextMenu();
        this.patchIncomingMessages();
    }

    patchFolderContextMenu() {
        ContextMenu.getDiscordMenu("GuildFolderContextMenu").then(cm => {
            Patcher.after(cm, "default", (_, [{folderId}], ret) => {
                const guilds = BdApi.getData("AutoMarkAsRead", "markAsReadGuilds") ?? [];
                const guildsInFolder = GuildFolders.find(e => e.folderId == folderId).guildIds;
                const autoMarkAsRead = guildsInFolder.some(id => guilds.includes(id));
                const menu = ContextMenu.buildMenuChildren([{
                    label: "AutoMarkAsRead",
                    children: ContextMenu.buildMenuChildren([
                        {
                            label: autoMarkAsRead ? "Disable AutoMarkAsRead" : "Automaticly mark as read",
                            danger: autoMarkAsRead,
                            action: () => { BdApi.saveData("AutoMarkAsRead", "markAsReadGuilds", autoMarkAsRead ? guilds.filter(e => !guildsInFolder.includes(e)) : [...guilds, ...guildsInFolder]); }
                        }
                    ])
                }]);
                ret.props.children = [ret.props.children, menu];
            });
        })
    }

    patchGuildContextMenu() {
        ContextMenu.getDiscordMenu("GuildContextMenu").then(cm => {
            Patcher.after(cm, "default", (_, [{ guild }], ret) => {
                const guilds = BdApi.getData("AutoMarkAsRead", "markAsReadGuilds") ?? [];
                const autoMarkAsRead = guilds.includes(guild.id);
                const menu = ContextMenu.buildMenuChildren([{
                    label: "AutoMarkAsRead",
                    children: ContextMenu.buildMenuChildren([
                        {
                            label: autoMarkAsRead ? "Disable AutoMarkAsRead" : "Automaticly mark as read",
                            danger: autoMarkAsRead,
                            action: () => { BdApi.saveData("AutoMarkAsRead", "markAsReadGuilds", autoMarkAsRead ? guilds.filter(e => e != guild.id) : [...guilds, guild.id]); }
                        }
                    ])
                }]);
                ret.props.children = [ret.props.children, menu];
            });
        })
    }

    patchChannelContextMenu() {
        ContextMenu.getDiscordMenu("useChannelDeleteItem").then(cm => {
            Patcher.after(cm, "default", (_, [{ id }], ret) => {
                const channels = BdApi.getData("AutoMarkAsRead", "markAsReadChannels") ?? [];
                const autoMarkAsRead = channels.includes(id);
                const menu = ContextMenu.buildMenuChildren([{
                    label: "AutoMarkAsRead",
                    children: ContextMenu.buildMenuChildren([
                        {
                            label: autoMarkAsRead ? "Disable AutoMarkAsRead" : "Automaticly mark as read",
                            danger: autoMarkAsRead,
                            action: () => { BdApi.saveData("AutoMarkAsRead", "markAsReadChannels", autoMarkAsRead ? channels.filter(e => e != id) : [...channels, id]); }
                        }
                    ])
                }]);
                return [ret, menu];
            });
        });
    }

    patchIncomingMessages() {
        Patcher.after(DiscordModules.Dispatcher, "_dispatch", (_, [{ message, type }]) => {
            if (type != DiscordModules.DiscordConstants.ActionTypes.MESSAGE_CREATE) return;

            const markAsReadGuilds = BdApi.getData("AutoMarkAsRead", "markAsReadGuilds") ?? [];
            const markAsReadChannels = BdApi.getData("AutoMarkAsRead", "markAsReadChannels") ?? [];

            if (markAsReadGuilds.includes(message.guild_id) || markAsReadChannels.includes(message.channel_id)) AckUtils.ack(`${message.channel_id}`);
        });
    }

    onStop() {
        Patcher.unpatchAll();
    }
}