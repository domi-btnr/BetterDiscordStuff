/**
 * @name ToggleAllPlugins
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.0
 * @description Toggles all Plugins
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js
 * @donate https://paypal.me/dominik1711
 */
/*@cc_on
@if (@_jscript)
	
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

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
      version: "1.0.0",
      description: "Toggles all Plugins",
      github:
        "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAllPlugins",
      github_raw:
        "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAllPlugins/ToggleAllPlugins.plugin.js",
    },
    changelog: [
      {
        title: "V1.0",
        type: "improved",
        items: ["New Settings Modal"],
      },
      {
        title: "FIXED",
        type: "fixed",
        items: ["Updating should now work"],
      },
    ],
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
          const { Settings, PluginUtilities } = Library;
          return class ToggleAllPlugins extends Plugin {
            get defaultSettings() {
              return {
                reloadDiscord: false,
                closeSettingsModal: true,
                pluginsToIgnore: ["BDFDB"],
              };
            }

            getSettingsPanel() {
              const panel = document.createElement("div");
              panel.className = "form";
              panel.style = "width:100%;";

              const doneButton = document.getElementsByClassName(
                "bd-button button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"
              );

              const enablePlugins = document.createElement("button");
              enablePlugins.className =
                "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN";
              enablePlugins.style = "margin-right: 8px;";
              enablePlugins.addEventListener("click", () => {
                if (this.settings.closeSettingsModal) {
                  doneButton[0].click();
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "Enabling all Plugins"
                );
                BdApi.showToast("Enabling all Plugins", { type: "info" });
                var plugins = BdApi.Plugins.getAll();
                for (var index = 0; index < plugins.length; index++) {
                  if (
                    !this.settings.pluginsToIgnore.includes(plugins[index].name)
                  ) {
                    if (!BdApi.Plugins.isEnabled(plugins[index].name)) {
                      BdApi.Plugins.enable(plugins[index].name);
                    }
                  } else {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      `Ignoring ${plugins[index].name}`
                    );
                  }
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "All Plugins enabled"
                );
                BdApi.showToast("All Plugins enabled", { type: "success" });
                if (this.settings.reloadDiscord) {
                  location.reload();
                }
              });
              enablePlugins.innerText = "Enable all Plugins";

              const disablePlugins = document.createElement("button");
              disablePlugins.className =
                "button-38aScr lookFilled-1Gx00P colorRed-1TFJan sizeMedium-1AC_Sl grow-q77ONN";
              disablePlugins.style = "margin-right: 8px;";
              disablePlugins.addEventListener("click", () => {
                if (this.settings.closeSettingsModal) {
                  doneButton[0].click();
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "Disabling all Plugins"
                );
                BdApi.showToast("Disabling all Plugins", { type: "info" });
                var plugins = BdApi.Plugins.getAll();
                for (var index = 0; index < plugins.length; index++) {
                  if (
                    !this.settings.pluginsToIgnore.includes(plugins[index].name)
                  ) {
                    if (
                      BdApi.Plugins.isEnabled(plugins[index].name) &&
                      plugins[index].name != config.info.name
                    ) {
                      BdApi.Plugins.disable(plugins[index].name);
                    }
                  } else {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      `Ignoring ${plugins[index].name}`
                    );
                  }
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "All Plugins disabled"
                );
                BdApi.showToast("All Plugins disabled", { type: "success" });
                if (this.settings.reloadDiscord) {
                  location.reload();
                }
              });
              disablePlugins.innerText = "Disable all Plugins";

              const buttonContainer = document.createElement("div");
              buttonContainer.style = "display: flex;";
              buttonContainer.appendChild(enablePlugins);
              buttonContainer.appendChild(disablePlugins);

              new Settings.SettingGroup("General", { shown: true })
                .appendTo(panel)
                .append(
                  new Settings.Switch(
                    "Reload Discord",
                    "Reloads Discord after the Plugins got toggled",
                    this.settings.reloadDiscord,
                    (checked) => {
                      if (checked) {
                        this.settings.reloadDiscord = true;
                      } else {
                        this.settings.reloadDiscord = false;
                      }
                      this.saveSettings();
                    }
                  )
                )
                .append(
                  new Settings.Switch(
                    "Close Plugin Settings",
                    "Close the Settings Modal after the Plugins got toggled",
                    this.settings.closeSettingsModal,
                    (checked) => {
                      if (checked) {
                        this.settings.closeSettingsModal = true;
                      } else {
                        this.settings.closeSettingsModal = false;
                      }
                      this.saveSettings();
                    }
                  )
                )
                .append(
                  new Settings.Textbox(
                    "Ignore Plugins",
                    "Put the name of all plugins that should get ignored when you toggle all Plugins in this textbox separated by a comma",
                    this.settings.pluginsToIgnore.join(","),
                    (val) => {
                      this.settings.pluginsToIgnore = val
                        .split(",")
                        .map((x) => x.trim())
                        .filter((x) => x);
                      this.saveSettings();
                    }
                  )
                )
                .append(buttonContainer);
              return panel;
            }

            loadSettings() {
              this.settings = PluginUtilities.loadSettings(
                this.getName(),
                this.defaultSettings
              );
            }

            saveSettings() {
              PluginUtilities.saveSettings(this.getName(), this.settings);
            }

            onStart() {
              this.loadSettings();
            }

            onStop() {}
          };
        };
        return plugin(Plugin, Library);
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();