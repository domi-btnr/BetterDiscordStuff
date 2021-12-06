/**
 * @name Someone
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.2
 * @description Brings back the @someone function
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/Someone
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/Someone/Someone.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
  info: {
    name: "Someone",
    authors: [
      {
        name: "HypedDomi",
        discord_id: "354191516979429376",
      },
    ],
    version: "1.2.0",
    description: "Brings back the @someone function",
    github:
      "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/Someone",
    github_raw:
      "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/Someone/Someone.plugin.js",
  },
  defaultConfig: [
    {
      type: "switch",
      id: "ignoreSelf",
      name: "Ignore yourself",
      value: true,
    },
    {
      type: "switch",
      id: "ignoreOffline",
      name: "Ignore offline users",
      value: true,
    },
  ],
  changelog: [
    {
      title: "FIXED",
      type: "fixed",
      items: ["Fixed freezing", "All @someone mentions will now be changed"],
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
      const { DiscordModules, Patcher } = Library;
      class Someone extends Plugin {
        constructor() {
          super();
          this.getSettingsPanel = () => {
            return this.buildSettingsPanel().getElement();
          };
        }
        onStart() {
          this.patchMessage();
        }

        onStop() {
          Patcher.unpatchAll();
        }

        patchMessage() {
          Patcher.before(
            DiscordModules.MessageActions,
            "sendMessage",
            (_, [, msg]) => {
              let count = (msg.content.match(/@someone/g) || []).length;
              for (let i = 0; i < count; i++) {
                msg.content = msg.content.replace(
                  "@someone",
                  this.getSomeone()
                );
              }
              if (msg.content.includes("@someone"))
                BdApi.showToast(
                  "No user found who is online\nDeactivate Ignore offline to ping offline members",
                  { type: "info", timeout: 3500 }
                );
            }
          );
        }

        getSomeone() {
          let MemberStore = BdApi.findModuleByProps(
            "getMembers",
            "getMemberIds"
          );
          let Member = MemberStore.getMemberIds(
            BdApi.findModuleByProps(
              "getLastSelectedGuildId"
            ).getLastSelectedGuildId()
          );
          if (this.settings.ignoreSelf) {
            Member = Member.filter(
              (e) =>
                e !==
                BdApi.findModuleByProps("getCurrentUser").getCurrentUser()["id"]
            );
          }
          let online = 0;
          for (let id in Member) {
            if (
              BdApi.findModuleByProps("getStatus").getStatus(Member[id]) !=
              "offline"
            )
              online++;
          }
          if (this.settings.ignoreOffline && online <= 0) {
            return "@someone";
          }
          Member = Member[Math.floor(Math.random() * Member.length)];
          let status = BdApi.findModuleByProps("getStatus").getStatus(Member);
          if (this.settings.ignoreOffline) {
            if (status == "offline") return this.getSomeone();
          }
          return `<@${Member}>`;
        }
      }
      return Someone;
    })(global.ZeresPluginLibrary.buildPlugin(config));