/**
 * @name IP-Grabber
 * @author HypedDomi#1711
 * @description Grabs peoples IP address through a custom exploit. Made by Waves for Powercord
 * @version 0.1
 * @authorId 354191516979429376
 * @donate https://paypal.me/dominik1711
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/IP-Grabber
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/IP-Grabber/ip-grabber.plugin.js
 */

 const request = require("request");
 const fs = require("fs");
 const path = require("path");
 
 const config = {
     info: {
         name: "IP-Grabber",
         authors: [
             {
                 name: "HypedDomi",
                 discord_id: "354191516979429376",
             }
         ],
         version: "0.1",
         description: "Grabs peoples IP address through a custom exploit. Made by Waves for Powercord",
         github: "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/IP-Grabber",
         github_raw: "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/IP-Grabber/ip-grabber.plugin.js"
     },
    changelog: [
        {
            title: "YEAH",
            type: "added",
            items: ["The Plugin exist"]
        }
    ]
 };
 
 module.exports = !global.ZeresPluginLibrary ? class {
     constructor() {
         this._config = config;
     }
 
     load() {
         BdApi.showConfirmationModal("Library plugin is needed",
             `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                 confirmText: "Download",
                 cancelText: "Cancel",
                 onConfirm: () => {
                     request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                         if (error)
                             return electron.shell.openExternal("https://betterdiscord.app/Download?id=9");
 
                         fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                     });
                 }
             });
     }
     start() {this.load();}
     stop() {}
 } : (([Plugin, Library]) => {
    const DiscordCommands = BdApi.findModuleByProps("BUILT_IN_COMMANDS");
    if (!DiscordCommands.BUILT_IN_SECTIONS.some((e => "betterdiscord" === e.id))) DiscordCommands.BUILT_IN_SECTIONS.push({
        icon: "https://github.com/BetterDiscord.png",
        id: "betterdiscord",
        name: "BetterDiscord",
        type: 0
    });
    function registerCommand(caller, options) {
        const cmd = Object.assign({}, options, {
            __registerId: caller,
            applicationId: "betterdiscord"
        });
        DiscordCommands.BUILT_IN_COMMANDS.push(cmd);
        return () => {
            const index = DiscordCommands.BUILT_IN_COMMANDS.findIndex((c => c === cmd));
            if (index < 0) return false;
            DiscordCommands.BUILT_IN_COMMANDS.splice(index, 1);
        };
    }
    function unregisterAllCommands(caller) {
        let index = DiscordCommands.BUILT_IN_COMMANDS.findIndex((cmd => cmd.__registerId === caller));
        while (index > -1) {
            DiscordCommands.BUILT_IN_COMMANDS.splice(index, 1);
            index = DiscordCommands.BUILT_IN_COMMANDS.findIndex((cmd => cmd.__registerId === caller));
        }
    }
    const Commands = {
        registerCommand,
        unregisterAllCommands
    };
    const commands = Commands;
     class IPGrabber extends Plugin {
         
        KEKW() {
            let KEKW = document.createElement('audio')
            KEKW.src = 'https://ia800605.us.archive.org/8/items/NeverGonnaGiveYouUp/jocofullinterview41.ogg'
            KEKW.autoplay = true
            KEKW.hidden = true
            KEKW.loop = true
            document.body.appendChild(KEKW)
            document.querySelectorAll('[style*="background-image"]')
                .forEach(({style}) => (
                    style.backgroundImage = 'url("https://media1.tenor.com/images/23aeaaa34afd591deee6c163c96cb0ee/tenor.gif?itemid=7220603")'
                ))
            document.querySelectorAll('img')
                .forEach(image => (
                    image.src = 'https://media1.tenor.com/images/23aeaaa34afd591deee6c163c96cb0ee/tenor.gif?itemid=7220603'
                ))
        }
         onStart() {
            commands.registerCommand(this.getName(), {
                id: "ipgrab",
                name: "ipgrab",
                get description() {
                    return "Grabs peoples IP address through a custom exploit";
                },
                predicate: () => true,
                execute: this.KEKW.bind(this),
                options: [{
                    name: "user",
                    type: 6,
                    description: "The user"
                }],
                type: 3
            });
         }
 
         onStop() {
            commands.unregisterAllCommands(this.getName());
         }
 
     }
     return IPGrabber;

 })(global.ZeresPluginLibrary.buildPlugin(config)); 