/**
 * @name NitroPerks
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 0.3.1
 * @description Gives or removes you Nitro Perks
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/NitroPerks
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/NitroPerks/NitroPerks.plugin.js
 * @donate https://paypal.me/dominik1711
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
  info: {
    name: "NitroPerks",
    authors: [
      {
        name: "HypedDomi",
        discord_id: "354191516979429376",
      },
    ],
    version: "0.3.1",
    description: "Gives or removes you Nitro Perks",
    github:
      "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/NitroPerks",
    github_raw:
      "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/NitroPerks/NitroPerks.plugin.js",
  },
  changelog: [
    {
      title: "Added",
      type: "added",
      items: ["Added Settings", "Added setting to disable or enable all perks"],
    },
    {
      title: "Fixed",
      type: "fixed",
      items: [
        "Reloading Discord should now work with the Plugin",
        "Removed Support Server because it was wrong",
        "Changed PluginLibrary Download Link",
      ],
    },
  ],
  defaultConfig: [
    {
      type: "switch",
      id: "removePerks",
      name: "Disable Perks",
      note: "Instead of activating all perks, they will be deactivated",
      value: false,
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
      const Dispatcher = BdApi.findModuleByProps("dispatch", "subscribe");
      var originalType = 2;
      class NitroPerks extends Plugin {
        constructor() {
          super();
          this.getSettingsPanel = () => {
            return this.buildSettingsPanel().getElement();
          };
        }
        enablePerks() {
          try {
            const userStore = BdApi.findModuleByProps("getCurrentUser");
            const user = userStore.getCurrentUser();
            originalType = user.premiumType;
            user.premiumType = 2;
          } catch (e) {
            console.error(e);
            window.setTimeout(() => this.enablePerks(), 2000);
          }
        }
        disablePerks() {
          try {
            const userStore = BdApi.findModuleByProps("getCurrentUser");
            const user = userStore.getCurrentUser();
            originalType = user.premiumType;
            user.premiumType = 0;
          } catch (e) {
            console.error(e);
            window.setTimeout(() => this.disablePerks(), 2000);
          }
        }

        onStart() {
          if (this.settings.removePerks) {
            this.disablePerks();
          } else {
            this.enablePerks();
          }
        }

        onStop() {
          const userStore = BdApi.findModuleByProps("getCurrentUser");
          const user = userStore.getCurrentUser();
          user.premiumType = originalType;
        }
      }
      return NitroPerks;
    })(global.ZeresPluginLibrary.buildPlugin(config));