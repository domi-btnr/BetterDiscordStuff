/**
 * @name ToggleAll
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.2.1
 * @description Toggles all Plugins or Themes
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAll
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAll/ToggleAll.plugin.js
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

const request = require("request");
const fs = require("fs");
const path = require("path");

module.exports = (() => {
  const config = {
    info: {
      name: "ToggleAll",
      authors: [
        {
          name: "HypedDomi",
          discord_id: "354191516979429376",
        },
      ],
      version: "1.2.1",
      description: "Toggles all Plugins or Themes",
      github:
        "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/ToggleAll",
      github_raw:
        "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/ToggleAll/ToggleAll.plugin.js",
    },
    changelog: [
      {
        title: "NEW",
        type: "added",
        items: ["Added Buttons to the Plugins/Themes Page for quicker toggle"],
      },
      {
        title: "FIXED",
        type: "fixed",
        items: ["Open Plugins/Themes Button works now correctly"],
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
          let titlePatched,
            beforePlugin,
            beforeTheme = false;
          return class ToggleAll extends Plugin {
            get defaultSettings() {
              return {
                reloadDiscord: false,
                closeSettingsModal: true,
                pluginsToIgnore: ["BDFDB"],
                themesToIgnore: [""],
              };
            }

            observer(changes) {
              const BDSettingsHeader = document.getElementsByClassName(
                "bd-settings-title h2-2gWE-o title-3sZWYQ"
              )[0];
              const inBDSettings = document.contains(BDSettingsHeader);
              if (inBDSettings) {
                const inPluginSettings = BDSettingsHeader.innerText.includes(
                  "PLUGINS"
                );
                const inThemeSettings = BDSettingsHeader.innerText.includes(
                  "THEMES"
                );

                const openFolder = document.createElement("button");
                openFolder.className = "bd-button bd-button-title";

                const enableAll = document.createElement("button");
                enableAll.className = "bd-button bd-button-title";
                enableAll.style = "float: right;";

                const disableAll = document.createElement("button");
                disableAll.className =
                  "bd-button bd-button-title bd-button-danger";
                disableAll.style = "float: right;";

                if (beforePlugin != inPluginSettings) {
                  titlePatched = false;
                  beforePlugin = inPluginSettings;
                }

                if (beforeTheme != inThemeSettings) {
                  titlePatched = false;
                  beforeTheme = inThemeSettings;
                }

                if (inPluginSettings && !titlePatched) {
                  let enabledPlugins = 0;
                  const plugins = BdApi.Plugins.getAll();
                  for (let index = 0; index < plugins.length; index++) {
                    if (BdApi.Plugins.isEnabled(plugins[index].id)) {
                      enabledPlugins++;
                    }
                  }

                  BDSettingsHeader.innerHTML = `PLUGINS - ${enabledPlugins}/${
                    plugins.length + 1
                  }`;
                  openFolder.innerText = "Open Plugins Folder";
                  openFolder.addEventListener("click", () => {
                    require("child_process").exec(
                      `start "" "${BdApi.Plugins.folder}"`
                    );
                  });
                  disableAll.innerText = "Disable all Plugins";
                  enableAll.innerText = "Enable all Plugins";

                  disableAll.addEventListener("click", () => {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      "Disabling all Plugins"
                    );
                    BdApi.showToast("Disabling all Plugins", { type: "info" });
                    const plugins = BdApi.Plugins.getAll();
                    for (var index = 0; index < plugins.length; index++) {
                      if (
                        !this.settings.pluginsToIgnore.includes(
                          plugins[index].name
                        )
                      ) {
                        if (plugins[index].name != config.info.name) {
                          BdApi.Plugins.disable(plugins[index].id);
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
                    BdApi.showToast("All Plugins disabled", {
                      type: "success",
                    });
                    if (this.settings.reloadDiscord) {
                      location.reload();
                    }
                  });

                  enableAll.addEventListener("click", () => {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      "Enabling all Plugins"
                    );
                    BdApi.showToast("Enabling all Plugins", { type: "info" });
                    const plugins = BdApi.Plugins.getAll();
                    for (var index = 0; index < plugins.length; index++) {
                      if (
                        !this.settings.pluginsToIgnore.includes(
                          plugins[index].name
                        )
                      ) {
                        BdApi.Plugins.enable(plugins[index].id);
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

                  BDSettingsHeader.appendChild(openFolder);
                  BDSettingsHeader.appendChild(disableAll);
                  BDSettingsHeader.appendChild(enableAll);
                  titlePatched = true;
                } else if (inThemeSettings && !titlePatched) {
                  let enabledThemes = 0;
                  const themes = BdApi.Themes.getAll();
                  for (let index = 0; index < themes.length; index++) {
                    if (BdApi.Themes.isEnabled(themes[index].id)) {
                      enabledThemes++;
                    }
                  }

                  BDSettingsHeader.innerHTML = `THEMES - ${enabledThemes}/${
                    themes.length + 1
                  }`;
                  openFolder.innerText = "Open Themes Folder";
                  openFolder.addEventListener("click", () => {
                    require("child_process").exec(
                      `start "" "${BdApi.Themes.folder}"`
                    );
                  });
                  disableAll.innerText = "Disable all Themes";
                  enableAll.innerText = "Enable all Themes";

                  disableAll.addEventListener("click", () => {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      "Disabling all Themes"
                    );
                    BdApi.showToast("Disabling all Themes", { type: "info" });
                    const themes = BdApi.Themes.getAll();
                    for (var index = 0; index < themes.length; index++) {
                      if (
                        !this.settings.themesToIgnore.includes(
                          themes[index].name
                        )
                      ) {
                        BdApi.Themes.disable(themes[index].id);
                      } else {
                        console.log(
                          `%c${config.info.name}`,
                          "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                          `Ignoring ${themes[index].name}`
                        );
                      }
                    }
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      "All Themes disabled"
                    );
                    BdApi.showToast("All Themes disabled", { type: "success" });
                    if (this.settings.reloadDiscord) {
                      location.reload();
                    }
                  });

                  enableAll.addEventListener("click", () => {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      "Enabling all Themes"
                    );
                    BdApi.showToast("Enabling all Themes", { type: "info" });
                    const themes = BdApi.Themes.getAll();
                    for (var index = 0; index < themes.length; index++) {
                      if (
                        !this.settings.themesToIgnore.includes(
                          themes[index].name
                        )
                      ) {
                        BdApi.Themes.enable(themes[index].id);
                      } else {
                        console.log(
                          `%c${config.info.name}`,
                          "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                          `Ignoring ${themes[index].name}`
                        );
                      }
                    }
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      "All Themes enabled"
                    );
                    BdApi.showToast("All Themes enabled", { type: "success" });
                    if (this.settings.reloadDiscord) {
                      location.reload();
                    }
                  });

                  BDSettingsHeader.appendChild(openFolder);
                  BDSettingsHeader.appendChild(disableAll);
                  BDSettingsHeader.appendChild(enableAll);
                  titlePatched = true;
                }
              } else {
                titlePatched = false;
              }
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
                const plugins = BdApi.Plugins.getAll();
                for (var index = 0; index < plugins.length; index++) {
                  if (
                    !this.settings.pluginsToIgnore.includes(plugins[index].name)
                  ) {
                    BdApi.Plugins.enable(plugins[index].id);
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
                const plugins = BdApi.Plugins.getAll();
                for (var index = 0; index < plugins.length; index++) {
                  if (
                    !this.settings.pluginsToIgnore.includes(plugins[index].name)
                  ) {
                    if (plugins[index].name != config.info.name) {
                      BdApi.Plugins.disable(plugins[index].id);
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

              const enableThemes = document.createElement("button");
              enableThemes.className =
                "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN";
              enableThemes.style = "margin-right: 8px;";
              enableThemes.addEventListener("click", () => {
                if (this.settings.closeSettingsModal) {
                  doneButton[0].click();
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "Enabling all Themes"
                );
                BdApi.showToast("Enabling all Themes", { type: "info" });
                const themes = BdApi.Themes.getAll();
                for (var index = 0; index < themes.length; index++) {
                  if (
                    !this.settings.themesToIgnore.includes(themes[index].name)
                  ) {
                    BdApi.Themes.enable(themes[index].id);
                  } else {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      `Ignoring ${themes[index].name}`
                    );
                  }
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "All Themes enabled"
                );
                BdApi.showToast("All Themes enabled", { type: "success" });
                if (this.settings.reloadDiscord) {
                  location.reload();
                }
              });
              enableThemes.innerText = "Enable all Themes";

              const disableThemes = document.createElement("button");
              disableThemes.className =
                "button-38aScr lookFilled-1Gx00P colorRed-1TFJan sizeMedium-1AC_Sl grow-q77ONN";
              disableThemes.style = "margin-right: 8px;";
              disableThemes.addEventListener("click", () => {
                if (this.settings.closeSettingsModal) {
                  doneButton[0].click();
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "Disabling all Themes"
                );
                BdApi.showToast("Disabling all Themes", { type: "info" });
                const themes = BdApi.Themes.getAll();
                for (var index = 0; index < themes.length; index++) {
                  if (
                    !this.settings.themesToIgnore.includes(themes[index].name)
                  ) {
                    BdApi.Themes.disable(themes[index].id);
                  } else {
                    console.log(
                      `%c${config.info.name}`,
                      "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                      `Ignoring ${themes[index].name}`
                    );
                  }
                }
                console.log(
                  `%c${config.info.name}`,
                  "background: #e91e63; color: white; padding: 2px; border-radius: 4px; font-weight: bold;",
                  "All Themes disabled"
                );
                BdApi.showToast("All Themes disabled", { type: "success" });
                if (this.settings.reloadDiscord) {
                  location.reload();
                }
              });
              disableThemes.innerText = "Disable all Themes";

              const buttonContainer = document.createElement("div");
              buttonContainer.style = "display: flex;";
              buttonContainer.appendChild(enablePlugins);
              buttonContainer.appendChild(disablePlugins);
              buttonContainer.appendChild(enableThemes);
              buttonContainer.appendChild(disableThemes);

              new Settings.SettingGroup("General", { shown: true })
                .appendTo(panel)
                .append(
                  new Settings.Switch(
                    "Reload Discord",
                    "Reloads Discord after the Plugins / Themes got toggled",
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
                    "Close the Settings Modal after the Plugins / Themes got toggled",
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
                .append(
                  new Settings.Textbox(
                    "Ignore Themes",
                    "Put the name of all themes that should get ignored when you toggle all Themes in this textbox separated by a comma",
                    this.settings.themesToIgnore.join(","),
                    (val) => {
                      this.settings.themesToIgnore = val
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
