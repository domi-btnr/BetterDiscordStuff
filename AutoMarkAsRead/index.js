import BasePlugin from "@zlibrary/plugin";
import { Patcher, ContextMenu, DiscordModules } from "@zlibrary";

const AckUtils = BdApi.findModuleByProps("ack");
export default class AutoMarkAsRead extends BasePlugin {
    onStart() {
        this.patchGuildContextMenu();
        this.patchChannelContextMenu();
        this.patchIncomingMessages();
    }

    patchGuildContextMenu() {
        ContextMenu.getDiscordMenu("GuildContextMenu").then(m => {
            Patcher.after(m, "default", (_, [{ guild }], ret) => {
                const guilds = BdApi.getData("AutoMarkAsRead", "markAsReadGuilds") ?? [];
                const autoMarkAsRead = guilds.includes(guild.id);
                const menu = ContextMenu.buildMenuChildren([{
                    label: "AutoMarkAsRead",
                    children: ContextMenu.buildMenuChildren([
                        {
                            label: autoMarkAsRead ? "Disable AutoMarkAsRead" : "Automaticly mark as read",
                            danger: autoMarkAsRead,
                            action: () => { BdApi.saveData("AutoMarkAsRead", "markAsReadGuilds", autoMarkAsRead ? guilds.filter(c => c != guild.id) : [...guilds, guild.id]); }
                        }
                    ])
                }]);
                ret.props.children = [ret.props.children, menu];
            });
        })
    }

    patchChannelContextMenu() {
        ContextMenu.getDiscordMenu("useChannelDeleteItem").then(m => {
            Patcher.after(m, "default", (_, [{ id }], ret) => {
                const channels = BdApi.getData("AutoMarkAsRead", "markAsReadChannels") ?? [];
                const autoMarkAsRead = channels.includes(id);
                const menu = ContextMenu.buildMenuChildren([{
                    label: "AutoMarkAsRead",
                    children: ContextMenu.buildMenuChildren([
                        {
                            label: autoMarkAsRead ? "Disable AutoMarkAsRead" : "Automaticly mark as read",
                            danger: autoMarkAsRead,
                            action: () => { BdApi.saveData("AutoMarkAsRead", "markAsReadChannels", autoMarkAsRead ? channels.filter(c => c != id) : [...channels, id]); }
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