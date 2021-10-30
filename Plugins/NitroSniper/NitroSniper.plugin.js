/**
 * @name NitroSniper
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 0.4
 * @description Automatically redeems Discord nitro gift codes
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/NitroSniper
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/NitroSniper/NitroSniper.plugin.js
 * @donate https://paypal.me/dominik1711
 */

 const request = require("request");
 const fs = require("fs");
 const path = require("path");
 
 const config = {
   info: {
     name: "NitroSniper",
     authors: [
       {
         name: "HypedDomi",
         discord_id: "354191516979429376",
         github_username: "HypedDomi",
       },
       {
         name: "Nexons",
         github_username: "Nexons",
       },
     ],
     version: "0.4.0",
     description: "Automatically redeems Discord nitro gift codes",
     github:
       "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/NitroSniper",
     github_raw:
       "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/NitroSniper/NitroSniper.plugin.js",
   },
   changelog: [
     {
       title: "Improved",
       type: "improved",
       items: ["Added Mentions to Modals"],
     },
     {
       title: "Fixed",
       type: "fixed",
       items: ["Now it's the right update"],
     },
   ],
   defaultConfig: [
     {
       type: "switch",
       id: "ignoreSelf",
       name: "Ignore yourself",
       note: "Ignore Discord Gift Links from yourself",
       value: true,
     },
     {
       type: "dropdown",
       id: "toast",
       name: "Notification Type",
       note:
         "Modal contains more information, but appears with every notification and only disappears when you click on Done",
       value: true,
       options: [
         { label: "Toast", value: true },
         { label: "Modal", value: false },
       ],
     },
     {
       type: "dropdown",
       id: "notifications",
       name: "Notifications",
       value: 0,
       options: [
         { label: "All Notifications", value: 0 },
         { label: "Only successful ones", value: 1 },
         { label: "Disable Notifications", value: 2 },
       ],
     },
     {
       type: "switch",
       id: "webhook",
       name: "Enable Webhook",
       note: "Sends a webhook upon successful redemption",
       value: false,
     },
     {
       type: "textbox",
       id: "webhookUrl",
       name: "Webhook Url",
       note: "Sends a webhook to the following url with more details",
       value: "",
     },
   ],
 };
 
 module.exports = !global.ZeresPluginLibrary
   ? class {
       constructor() {
         this._config = config;
       }
 
       load() {
         BdApi.showConfirmationModal(
           "Library plugin is needed",
           `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
           {
             confirmText: "Download",
             cancelText: "Cancel",
             onConfirm: () => {
               request.get(
                 "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                 (error, response, body) => {
                   if (error)
                     return electron.shell.openExternal(
                       "https://betterdiscord.app/Download?id=9"
                     );
 
                   fs.writeFileSync(
                     path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                     body
                   );
                 }
               );
             },
           }
         );
       }
       start() {
         this.load();
       }
       stop() {}
     }
   : (([Plugin, Library]) => {
       const { DiscordModules, WebpackModules } = Library;
       const {
         React,
         UserStore,
         UserInfoStore,
         ChannelStore,
         GuildStore,
       } = DiscordModules;
       let user = "";
       let token = "";
       class NitroSniper extends Plugin {
         constructor() {
           super();
           this.getSettingsPanel = () => {
             return this.buildSettingsPanel().getElement();
           };
         }
         onStart() {
           user = UserStore.getCurrentUser();
           token = UserInfoStore.getToken();
           console.log(
             `%c${config.info.name}`,
             "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
             "Starting sniping as " + user.tag
           );
           BdApi.showToast("Starting sniping as " + user.tag, { type: "info" });
           this.unpatchDispatch = BdApi.monkeyPatch(
             BdApi.findModuleByProps("dispatch"),
             "dispatch",
             { after: this.dispatch.bind(this) }
           );
         }
         dispatch(dispatched) {
           if (
             dispatched.methodArguments[0].type !== "MESSAGE_CREATE" &&
             dispatched.methodArguments[0].type !== "MESSAGE_UPDATE"
           )
             return;
 
           const message = dispatched.methodArguments[0].message;
 
           if (message.content == null) return;
 
           if (this.settings.ignoreSelf && message.author.id == user.id) return;
 
           const giftUrlArray =
             message.content.match(
               /(https?:\/\/)?(www\.)?(discord\.gift)\/[^_\W]+/g
             ) ||
             message.content.match(
               /(https?:\/\/)?(www\.)?(discordapp\.com\/gifts)\/[^_\W]+/g
             ) ||
             message.content.match(
               /(https?:\/\/)?(www\.)?(discord\.com\/gifts)\/[^_\W]+/g
             );
 
           if (giftUrlArray == null) return;
 
           const guild =
             GuildStore.getGuild(message.guild_id).name || "Private Message";
           const UserRow = React.createElement(
             "div",
             {
               class: "markdown-11q6EU paragraph-3Ejjt0",
               style: { marginBottom: "8px" },
             },
             [
               "User: ",
               React.createElement(
                 WebpackModules.getByDisplayName("UserMention"),
                 {
                   className: "mention",
                   userId: message.author.id,
                   channelId: message.channel_id,
                 }
               ),
             ]
           );
           const ChannelRow = React.createElement(
             "div",
             {
               class: "markdown-11q6EU paragraph-3Ejjt0",
               style: { marginBottom: "8px" },
             },
             [
               "Channel: ",
               React.createElement(WebpackModules.getByDisplayName("Mention"), {
                 role: "link",
                 iconType: "text",
                 children: [ChannelStore.getChannel(message.channel_id).name],
               }),
             ]
           );
           giftUrlArray.forEach(async (giftUrl) => {
             const code = giftUrl
               .replace(/(https?:\/\/)?(www\.)?(discord\.gift)\//g, "")
               .replace(/(https?:\/\/)?(www\.)?(discordapp\.com\/gifts)\//g, "")
               .replace(/(https?:\/\/)?(www\.)?(discord\.com\/gifts)\//g, "");
             console.log(code);
             if (token == null || token === "") {
               if (
                 this.settings.notifications != 1 &&
                 this.settings.notifications != 2
               )
                 console.error(
                   `%c${config.info.name}`,
                   "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                   "Invalid token. Please restart NitroSniper or Discord"
                 );
               BdApi.showToast(
                 "Invalid token. Please restart NitroSniper or Discord",
                 { type: "error", timeout: 5000 }
               );
               return;
             }
 
             const response = await fetch(
               `https://discord.com/api/v9/entitlements/gift-codes/${code}/redeem`,
               {
                 method: "POST",
                 headers: {
                   Accept: "application/json, text/javascript, */*; q=0.01",
                   Authorization: token,
                   "Content-Type": "application/json",
                   "User-Agent":
                     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
                 },
               }
             );
             if (response.status == 200) {
               console.info(
                 `%c${config.info.name}`,
                 "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                 `Successfully redeemed nitro code ${code}`
               );
               if (this.settings.notifications != 2) {
                 if (this.settings.toast)
                   BdApi.showToast(`Successfully redeemed nitro code ${code}`, {
                     type: "success",
                   });
                 else
                   BdApi.alert("Nitro code redeemed | NitroSniper", [
                     `Code: ${code}\n\nServer: ${guild}`,
                     ChannelRow,
                     UserRow,
                     `Message Link: https://discord.com/channels/${
                       message.guild_id || "@me"
                     }/${message.channel_id}/${message.id}`,
                   ]);
               }
               if (this.settings.webhook) {
                 if (this.settings.webhookUrl == "") {
                   console.console.error(
                     `%c${config.info.name}`,
                     "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                     "Your webhook url is empty. To use this feature, please enter a valid URL"
                   );
                   if (this.settings.toast)
                     BdApi.showToast(
                       "Your webhook url is empty. To use this feature, please enter a valid URL",
                       { type: "error", timeout: 5000 }
                     );
                   else
                     BdApi.alert(
                       "Empty Webhook URL | NitroSniper",
                       "Your webhook url is empty. To use this feature, please enter a valid URL"
                     );
                   return;
                 }
                 const data = {
                   content: `<@${user.id}>`,
                   embeds: [
                     {
                       title: `${guild}, #${channel}`,
                       url: `https://discord.com/channels/${
                         message.guild_id || "@me"
                       }/${message.channel_id}/${message.id}`,
                       description: `Nitro Code: \`${code}\``,
                       color: 16732345,
                       author: {
                         name: `${message.author.username}#${message.author.discriminator}`,
                         icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
                       },
                       footer: {
                         text: "BetterDiscord NitroSniper",
                       },
                       timestamp: new Date().toISOString(),
                     },
                   ],
                 };
                 await fetch(this.settings.webhookUrl, {
                   method: "POST",
                   headers: {
                     Accept: "application/json",
                     "Content-Type": "application/json",
                   },
                   body: JSON.stringify(data),
                 });
               }
               return;
             } else if (response.status == 400) {
               console.error(
                 `%c${config.info.name}`,
                 "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                 `Failed to redeem invalid nitro code ${code}`
               );
               if (
                 this.settings.notifications != 2 &&
                 this.settings.notifications != 1
               ) {
                 if (this.settings.toast)
                   BdApi.showToast(
                     `Failed to redeem invalid nitro code ${code}`,
                     { type: "error" }
                   );
                 else
                   BdApi.alert("Invalid Nitro code | NitroSniper", [
                     `Code: ${code}\n\nServer: ${guild}`,
                     ChannelRow,
                     UserRow,
                     `Message Link: https://discord.com/channels/${
                       message.guild_id || "@me"
                     }/${message.channel_id}/${message.id}`,
                   ]);
               }
               return;
             } else if (response.status == 403) {
               console.error(
                 `%c${config.info.name}`,
                 "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                 `Something went wrong while trying to redeem code ${code}. Please restart NitroSniper or Discord`
               );
               if (
                 this.settings.notifications != 2 &&
                 this.settings.notifications != 1
               ) {
                 if (this.settings.toast)
                   BdApi.showToast(
                     `Something went wrong while trying to redeem code ${code}. Please restart NitroSniper or Discord`,
                     { type: "error", timeout: 5000 }
                   );
                 else
                   BdApi.alert(
                     "Invalid Nitro code | NitroSniper",
                     `Something went wrong while trying to redeem code ${code}. Please restart NitroSniper or Discord`
                   );
               }
               return;
             } else {
               console.error(
                 `%c${config.info.name}`,
                 "background: #FA6EF6; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                 `Something went wrong while trying to redeem code ${code}. Please restart NitroSniper or Discord`
               );
               if (
                 this.settings.notifications != 2 &&
                 this.settings.notifications != 1
               ) {
                 if (this.settings.toast)
                   BdApi.showToast(
                     `Something went wrong while trying to redeem code ${code}. Please restart NitroSniper or Discord`,
                     { type: "error", timeout: 5000 }
                   );
                 else
                   BdApi.alert(
                     "Invalid Nitro code | NitroSniper",
                     "Something went wrong while trying to redeem code ${code}. Please restart NitroSniper or Discord" +
                       `\n\nDiscord returned error code: ${response.status}, when trying to redeem nitro code: ${code}`
                   );
               }
               return;
             }
           });
         }
 
         onStop() {
           if (this.unpatchDispatch != null) this.unpatchDispatch();
         }
       }
       return NitroSniper;
     })(global.ZeresPluginLibrary.buildPlugin(config));
 