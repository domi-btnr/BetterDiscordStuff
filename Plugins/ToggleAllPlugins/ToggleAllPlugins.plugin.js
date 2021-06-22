/**
 * @name ToggleAllPlugins
 * @author HypedDomi#1711
 * @description Toggles all Plugins
 * @version 0.1
 * @authorId 354191516979429376
 * @donate https://paypal.me/dominik1711
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js
 */

 const request = require("request");
 const fs = require("fs");
 const path = require("path");
 
 const config = {
     info: {
         name: "ToggleAllPlugins",
         authors: [
             {
                 name: "HypedDomi",
                 discord_id: "354191516979429376",
             }
         ],
         version: "0.1",
         description: "Toggles all Plugins",
         github: "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins",
         github_raw: "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js"
     },
     defaultConfig: [
        {
            type: "switch",
            id: "enableAll",
            name: "Enable all Plugins",
            note: "If enabled the Plugin will enable all Plugins, otherwise it will disable all Plugins",
            value: true
        }
    ],
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
     class ToggleAllPlugins extends Plugin {
        constructor() {
            super();
            this.getSettingsPanel = () => {
               return this.buildSettingsPanel().getElement();
           };
        }
        onStart() {
            if(this.settings.enableAll){
                BdApi.showToast("Enabling all Plugins", {type: "info"});            
                var plugins = BdApi.Plugins.getAll();
                for (var index = 0; index < plugins.length; index++) {
                    if(!BdApi.Plugins.isEnabled(plugins[index].name)){
                        BdApi.Plugins.enable(plugins[index].name);
                    }
                }
                BdApi.showToast("All Plugins enabled", {type: "success"});
                BdApi.Plugins.disable(config.info.name);
            }else{
                BdApi.showToast("Disabling all Plugins", {type: "info"});            
                var plugins = BdApi.Plugins.getAll();
                for (var index = 0; index < plugins.length; index++) {
                    if(BdApi.Plugins.isEnabled(plugins[index].name) && plugins[index].name != config.info.name){
                        BdApi.Plugins.disable(plugins[index].name);
                    }
                }
                BdApi.showToast("All Plugins disabled", {type: "success"});
                BdApi.Plugins.disable(config.info.name);
            }
        }

        onStop() {
        }
     }
     return ToggleAllPlugins;

 })(global.ZeresPluginLibrary.buildPlugin(config)); 