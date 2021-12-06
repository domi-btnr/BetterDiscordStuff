/**
 * @name QuickAddonDownloader
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.0
 * @description Allows you to download Addons from Chat directly to your Plugins or Themes folder
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/QuickAddonDownloader
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/QuickAddonDownloader/QuickAddonDownloader.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const https = require("https");
const fs = require("fs");
const path = require("path");

const config = {
  info: {
    name: "QuickAddonDownloader",
    authors: [
      {
        name: "HypedDomi",
        discord_id: "354191516979429376",
      },
    ],
    version: "1.0.0",
    description:
      "Allows you to download Addons from Chat directly to your Plugins or Themes folder",
    github:
      "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/QuickAddonDownloader",
    github_raw:
      "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/QuickAddonDownloader/QuickAddonDownloader.plugin.js",
  },
  changelog: [
    {
      title: "YEAH",
      type: "added",
      items: ["The Plugin exists"],
    },
  ],
  defaultConfig: [
    {
      type: "switch",
      id: "enableAddon",
      name: "Enable Addon after download",
      value: true,
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
    stop() { }
  }
  : (([Plugin, Library]) => {
    const { Patcher, DiscordModules, Utilities } = Library;
    const { React } = DiscordModules;
    const MiniPopover = BdApi.findModule(m => m.default?.displayName === "MiniPopover");
    const TooltipContainer = BdApi.findModuleByProps('TooltipContainer').TooltipContainer;

    const PluginIcon = [React.createElement("path", { fill: "none", d: "M0 0h24v24H0z" }), React.createElement("path", { fill: "currentColor", d: "M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" })];
    const ThemeIcon = [React.createElement("path", { fill: "none", d: "M0 0h24v24H0z" }), React.createElement("path", { fill: "currentColor", d: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" })];

    class QuickAddonDownloader extends Plugin {
      constructor() {
        super();
        this.getSettingsPanel = () => {
          return this.buildSettingsPanel().getElement();
        };
      }
      onStart() {
        this.patchMessageToolbar();
      }

      patchMessageToolbar() {
        Patcher.after(MiniPopover, "default", (_, [args], component) => {
          const props = Utilities.findInTree(args, e => e && e.message);
          if (!props) return;
          const { attachments } = props.message;
          if (attachments.length == 0 || !attachments[0].url || !attachments[0].proxy_url) return;
          const fileUrl = attachments[0].url || attachments[0].proxy_url;
          let isPluginExtension = fileUrl.endsWith(".plugin.js");
          let isThemeExtension = fileUrl.endsWith(".theme.css");
          if (!isPluginExtension && !isThemeExtension) return;

          let button =
            React.createElement(TooltipContainer, { text: isPluginExtension ? "Download Plugin" : "Download Theme" },
              React.createElement(MiniPopover.Button, { onClick: () => { this.downloadFile(fileUrl, isPluginExtension); } },
                React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24" }, isPluginExtension ? PluginIcon : ThemeIcon)));
          component.props.children.unshift(button);
        });
      }

      downloadFile(fileUrl, isPlugin) {
        const fileName = fileUrl.split("/").pop();
        if (isPlugin) {
          try {
            console.log(
              `%c${config.info.name}`,
              "background: #61B3DE; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
              `Downloading Plugin: ${fileName}`
            );
            https.get(fileUrl, function (response) {
              response.pipe(fs.createWriteStream(path.join(BdApi.Plugins.folder, fileName)));
            });
          } catch (e) {
            console.error(
              `%c${config.info.name}`,
              "background: #61B3DE; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
              "An error occurred\n",
              err
            );
            return BdApi.showToast("An Error occurred", { type: "error" });
          }
          if (this.settings.enableAddon) BdApi.Plugins.enable(fileName.replace(".plugin.js", ""));
          BdApi.showToast("Plugin downloaded", { type: "success" });
        } else {
          try {
            console.log(
              `%c${config.info.name}`,
              "background: #61B3DE; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
              `Downloading Theme: ${fileName}`
            );
            https.get(fileUrl, function (response) {
              response.pipe(fs.createWriteStream(path.join(BdApi.Themes.folder, fileName)));
            });
          } catch (e) {
            console.error(
              `%c${config.info.name}`,
              "background: #61B3DE; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
              "An error occurred\n",
              err
            );
            return BdApi.showToast("An Error occurred", { type: "error" });
          }
          if (this.settings.enableAddon) BdApi.Themes.enable(fileName.replace(".theme.css", ""));
          BdApi.showToast("Theme downloaded", { type: "success" });
        }
      }

      onStop() {
        Patcher.unpatchAll();
      }
    }
    return QuickAddonDownloader;
  })(global.ZeresPluginLibrary.buildPlugin(config));
