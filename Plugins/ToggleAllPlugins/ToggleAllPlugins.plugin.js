/**
 * @name ToggleAllPlugins
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.1
 * @description Toggles all Plugins
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js
 * @donate https://paypal.me/dominik1711
 */

 const request = require("request");
 const fs = require("fs");
 const path = require("path");
 
 require("request");
 module.exports = class ExamplePlugin {
   start() {
     BdApi.showConfirmationModal(
       "Plugin has been renamed",
       "The ToggleAllPlugins plugin has been renamed to ToggleAll. This version is only used to update to the new version. Please click download to install the plugin",
       {
         confirmText: "Download",
         cancelText: "Cancel",
         onConfirm: () => {
           request.get(
             "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAll/ToggleAll.plugin.js",
             (error, response, body) => {
               if (error)
                 return electron.shell.openExternal(
                   "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAll/ToggleAll.plugin.js"
                 );
 
               fs.writeFileSync(
                 path.join(BdApi.Plugins.folder, "ToggleAll.plugin.js"),
                 body
               );
             }
           );
           BdApi.Plugins.enable("ToggleAll");
           fs.unlinkSync(path.resolve(BdApi.Plugins.folder, "ToggleAllPlugins.plugin.js"));
         },
       }
     );
   }
   stop() {}
 };
 