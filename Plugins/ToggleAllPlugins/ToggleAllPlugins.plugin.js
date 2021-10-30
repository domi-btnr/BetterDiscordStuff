/**
 * @name ToggleAllPlugins
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.2
 * @description Toggles all Plugins
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js
 * @donate https://paypal.me/dominik1711
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

module.exports = (() => {
  const config = {
    info: {
      name: "ToggleAllPlugins",
      authors: [
        {
          name: "HypedDomi",
          discord_id: "354191516979429376",
        },
      ],
      version: "1.2.0",
      description: "Toggles all Plugins",
      github:
        "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins",
      github_raw:
        "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js",
    }
  };

  return !global.ZeresPluginLibrary
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
                      path.join(
                        BdApi.Plugins.folder,
                        "0PluginLibrary.plugin.js"
                      ),
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
        const plugin = (Plugin, Library) => {
          return class ToggleAllPlugins extends Plugin {
            onStart() {
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

            onStop() {}
          };
        };
        return plugin(Plugin, Library);
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
