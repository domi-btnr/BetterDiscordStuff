/**
 * @name NitroPerks
 * @author HypedDomi#1711
 * @description Gives you nitro features
 * @version 0.2
 * @authorId 354191516979429376
 * @source https://github.com/HypedDomi/hypeddomi.github.io/blob/master/BetterDiscord/plugins/NitroFeatures.plugin.js
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/hypeddomi.github.io/master/BetterDiscord/plugins/NitroFeatures.plugin.js
 * @donate https://paypal.me/dominik1711
 */

 module.exports = class NitroFeatures {
    originalType = null;
    load() {
        const userStore = BdApi.findModuleByProps("getCurrentUser");
        const user = userStore.getCurrentUser();
        this.originalType = user.premiumType;
    } // Optional function. Called when the plugin is loaded in to memory

    start() {
        const userStore = BdApi.findModuleByProps("getCurrentUser");
        const user = userStore.getCurrentUser();
        this.originalType = user.premiumType;
        user.premiumType = 2;
        BdApi.showToast("Enabled Nitro Features", {type: "success"})
    } // Required function. Called when the plugin is activated (including after reloads)
    stop() {
        const userStore = BdApi.findModuleByProps("getCurrentUser");
        const user = userStore.getCurrentUser();
        user.premiumType = this.originalType;
        BdApi.showToast("Disabled Nitro Features", {type: "success"})
    } // Required function. Called when the plugin is deactivated
}
