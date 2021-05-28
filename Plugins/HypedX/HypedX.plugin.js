/**
 * @name HypedX
 * @author HypedDomi#1711
 * @description Aktiviert die Spielaktivität und eine RichPresence wenn GTA erkannt wird
 * @version 0.3
 * @authorId 354191516979429376
 * @donate https://paypal.me/dominik1711
 * @source https://github.com/HypedDomi/hypeddomi.github.io/blob/master/BetterDiscord/plugins/HypedX.plugin.js
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/hypeddomi.github.io/master/BetterDiscord/plugins/HypedX.plugin.js
 * @invite Y9Ah3rE
 */

 const request = require("request");
 const fs = require("fs");
 const path = require("path");
 
 const config = {
     info: {
         name: "HypedX",
         authors: [
             {
                 name: "HypedDomi",
                 discord_id: "354191516979429376",
             }
         ],
         version: "0.3",
         description: "Aktiviert die Spielaktivität und eine RichPresence sobald GTA erkannt wird",
         github: "https://github.com/HypedDomi/hypeddomi.github.io/blob/master/BetterDiscord/plugins/HypedX.plugin.js",
         github_raw: "https://raw.githubusercontent.com/HypedDomi/hypeddomi.github.io/master/BetterDiscord/plugins/HypedX.plugin.js"
     },
     defaultConfig: [
        {
            type: "switch",
            id: "reloadDiscord",
            name: "Discord neuladen",
            note: "Lädt Discord neu, nachdem GTA geschlossen wurde (Deaktiviert schneller die RichPresence)",
            value: true
        }
    ],
    changelog: [
        {
            title: "Hinzugefügt",
            type: "added",
            items: ["Einstellungen hinzugefügt"]
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
                             return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
 
                         fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                     });
                 }
             });
     }
     start() {this.load();}
     stop() {}

     getSettingsPanel() {
        var settings = document.createElement("settings");
        settings.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">Test</div>`;
		return settings.content.firstElementChild;
    }
 } : (([Plugin, Library]) => {
     const Dispatcher = BdApi.findModuleByProps("dispatch", "subscribe");
     var enabled = false;
     class HypedX extends Plugin {
         constructor() {
             super();
         }

         async runningGamesChange(event) {
            const { games } = event;
            let _gameNotFound = 0;
            if(games.length > 0) {
                for(var i=0; i < games.length; i++){
                    if(games[i].name == "Grand Theft Auto V" && enabled == false){
                        try{
                            if(BdApi.Plugins.isEnabled("AutoStartRichPresence")){
                                BdApi.Plugins.disable("AutoStartRichPresence");
                                window.setTimeout(()=>BdApi.Plugins.enable("AutoStartRichPresence"), 2500);
                            }else{
                                BdApi.Plugins.enable("AutoStartRichPresence")
                            }
                            enabled = true;
                            _gameNotFound = 0;
                            console.log("[HypedX] Enabled AutoStartRichPresence");
                        }catch (e){
                            console.log(e);
                            BdApi.showToast("Es trat ein Fehler auf", {type: "error"})
                        }
                    }else if(games[i].name != "Grand Theft Auto V" && enabled == true) {_gameNotFound = _gameNotFound+1;}
                    if(_gameNotFound >= games.length){
                        try{
                            BdApi.Plugins.disable("AutoStartRichPresence");
                            enabled = false;
                            _gameNotFound = 0;
                            console.log("[HypedX] Disabled AutoStartRichPresence");
                            location.reload()
                        }catch (e){
                            console.log(e);
                            BdApi.showToast("Es trat ein Fehler auf", {type: "error"})
                        }
                    }
                }
            }else if(games.length == 0 && enabled == true){
                try{
                    BdApi.Plugins.disable("AutoStartRichPresence");
                    enabled = false;
                    _gameNotFound = 0;
                    console.log("[HypedX] Disabled AutoStartRichPresence");
                    location.reload()
                }catch (e){
                    console.log(e);
                    BdApi.showToast("Es trat ein Fehler auf", {type: "error"})
                }
            }
        }
 
         onStart() {
             Dispatcher.subscribe("RUNNING_GAMES_CHANGE", this.runningGamesChange);
         }
 
         onStop() {
             Dispatcher.unsubscribe("RUNNING_GAMES_CHANGE", this.runningGamesChange);
         }
 
     }
 
     return HypedX;
 })(global.ZeresPluginLibrary.buildPlugin(config)); 
