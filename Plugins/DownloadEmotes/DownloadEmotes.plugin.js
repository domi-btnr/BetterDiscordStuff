/**
 * @name DownloadEmotes
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.1.2
 * @description Downloads all emotes from a guild and saves them in your download directory
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/DownloadEmotes
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/DownloadEmotes/DownloadEmotes.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const https = require("https");
const fs = require("fs");
const path = require("path");

const config = {
  info: {
    name: "DownloadEmotes",
    authors: [
      {
        name: "HypedDomi",
        discord_id: "354191516979429376",
      },
    ],
    version: "1.1.2",
    description:
      "Downloads all emotes from a guild and saves them in your download directory",
    github:
      "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/DownloadEmotes",
    github_raw:
      "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/DownloadEmotes/DownloadEmotes.plugin.js",
  },
  changelog: [
    {
      title: "FIXED",
      type: "fixed",
      items: ["Fixed downloads on Unix Systems"],
    },
  ],
  defaultConfig: [
    {
      type: "switch",
      id: "openFolder",
      name: "Open Folder after download",
      note: "Opens the download folder after the emotes have been downloaded",
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
                if (error) return electron.shell.openExternal("https://betterdiscord.app/Download?id=9");
                fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
              }
            );
          },
        }
      );
    }
    start() {
      this.load();
    }
    stop() { }
  }
  : (([Plugin, Library]) => {
    const { Patcher, ContextMenu, DCM, PluginUtilities } = Library;
    let downloadsFolder;
    class DownloadEmotes extends Plugin {
      constructor() {
        super();
        this.getSettingsPanel = () => {
          return this.buildSettingsPanel().getElement();
        };
      }
      onStart() {
        this.patchContextMenu();
      }

      async patchContextMenu() {
        const GuildContextMenu = await ContextMenu.getDiscordMenu("GuildContextMenu");
        Patcher.after(GuildContextMenu, "default", (_, [props], component) => {
          const { guild } = props;
          component.props.children.push(
            DCM.buildMenuItem({
              label: "Download Emotes",
              type: "text",
              action: () => this.downloadEmotes(guild),
            })
          );
        });
      }

      getDownloadLocation() {
        if (downloadsFolder && fs.existsSync(downloadsFolder)) return downloadsFolder;
        const homePath = process.env.USERPROFILE || process.env.HOMEPATH || process.env.HOME;
        const downloadPath = homePath && path.join(homePath, "Downloads");
        if (downloadPath && fs.existsSync(downloadPath)) return (downloadsFolder = downloadPath);
        else {
          downloadsFolder = path.join(PluginUtilities.getPluginsFolder(), "downloads");
          if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder);
          return downloadsFolder;
        }
      }

      downloadEmotes(guild) {
        const downloadLocation = this.getDownloadLocation();
        const emoteStore = BdApi.findModuleByProps("getGuildEmoji");
        const emotes = emoteStore.getGuilds()[guild.id].emojis;
        if (emotes != null) {
          if (emotes.length != 0) {
            let folderName = guild;
            try {
              folderName = path.join(downloadLocation, guild.name);
              if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
            } catch (err) {
              console.warn(
                `%c${config.info.name}`,
                "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                "An error occurred. Trying to use ID as Foldername"
              );
              try {
                folderName = path.join(downloadLocation, guild.id);
                if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
              } catch (err) {
                console.error(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "An error occurred\n",
                  err
                );
                return BdApi.showToast("An Error occurred", {
                  type: "error",
                });
              }
            }
            try {
              console.log(
                `%c${config.info.name}`,
                "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                `Started downloading Emotes from ${guild}`
              );
              console.log(
                `%c${config.info.name}`,
                "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                `Saving Emotes to ${folderName}`
              );
              emotes.forEach(function (emote) {
                https.get(`https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? "gif" : "png"}`, function (response) {
                  response.pipe(
                    fs.createWriteStream(
                      path.join(folderName, `${emote.name}.${emote.animated ? "gif" : "png"}`))
                  );
                });
              });
              console.log(
                `%c${config.info.name}`,
                "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                "Emotes downloaded successfully"
              );
              BdApi.showToast(
                `Emotes downloaded to ${folderName}`,
                { type: "success" }
              );
              if (this.settings.openFolder) {
                require("child_process").exec(
                  `start "" "${folderName}"`
                );
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "Opened successfully File Explorer"
                );
              }
            } catch (err) {
              console.error(
                `%c${config.info.name}`,
                "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                "An error occurred\n",
                err
              );
              BdApi.showToast("An Error occurred", { type: "error" });
            }
          } else {
            BdApi.showToast("This guild has no Emotes", { type: "error" });
          }
        } else {
          BdApi.showConfirmationModal(
            "Emotes not loaded",
            "The emotes you are trying to reach could not be loaded. Please open the Emotetab in the guild settings or try again",
            {
              danger: false,
              confirmText: "Try again",
              cancelText: "Close",
              onConfirm: () => {
                this.downloadEmotes(guild);
              },
            }
          );
        }
      }

      getDescription() {
        return `${config.info.description}. Emotes are saved here: ${this.getDownloadLocation()}`;
      }

      onStop() {
        Patcher.unpatchAll();
      }
    }
    return DownloadEmotes;
  })(global.ZeresPluginLibrary.buildPlugin(config));
