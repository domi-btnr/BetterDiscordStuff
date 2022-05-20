interface Plugin {
    getName(): string;
    getAuthor(): string;
    getDescription(): string;
    getVersion(): string;
    start(): Function;
    stop(): Function;
}
interface Theme {
    added: number;
    author: string;
    css: string;
    version: string;
    description: string;
    filename: string;
    format: string;
    modified: number;
    size: number;
}
interface PatcherCallback {
    (thisObject: ThisType<Patcher>, methodArguments: Parameters<()=>any>, returnValue: any): void
}
interface ModuleFilter {
    (module: any): boolean
}
interface PatcherOptions {
    displayName?: string;
    type: "before"|"after"|"instead";
    forcePatch: boolean;
}
interface Patcher {
    /**
     * Patches a function with his this scope, arguments and returnValue.
     * @param caller Caller parameter for loggin and unpatch functions. Required.
     * @param module Any module you want to patch
     * @param moduleName The name of the module you want to patch
     * @param Callback Function what get executed before/after/instead when that function runs. 
     * @param options Options for the patcher eg. the type.
     * @returns Function to cancel the patch
     */
    patch(caller: string, module: object|Function, moduleName: string, callback: PatcherCallback, options: PatcherOptions): Function;

    /**
     * Alias for the `Patcher.patch` function. Automatically adds the `{type: "before"}` to the patcher function.
     * @param caller Caller parameter
     * @param caller Caller parameter for loggin and unpatch functions. Required.
     * @param module Any module you want to patch
     * @param moduleName The name of the module you want to patch
     * @param Callback Function what get executed before/after/instead when that function runs. 
     * @param options Options for the patcher eg. the type.
     * @returns Function to cancel the patch
     */
    before(caller: string, module: object|Function, moduleName: string, callback: PatcherCallback, options?: PatcherOptions): Function

    /**
     * Alias for the `Patcher.patch` function. Automatically adds the `{type: "after"}` to the patcher function.
     * @param caller Caller parameter
     * @param caller Caller parameter for loggin and unpatch functions. Required.
     * @param module Any module you want to patch
     * @param moduleName The name of the module you want to patch
     * @param Callback Function what get executed before/after/instead when that function runs. 
     * @param options Options for the patcher eg. the type.
     * @returns Function to cancel the patch
     */
    after(caller: string, module: object|Function, moduleName: string, callback: PatcherCallback, options?: PatcherOptions): Function;

    /**
     * Alias for the `Patcher.patch` function. Automatically adds the `{type: "instead"}` to the patcher function.
     * @param caller Caller parameter
     * @param caller Caller parameter for loggin and unpatch functions. Required.
     * @param module Any module you want to patch
     * @param moduleName The name of the module you want to patch
     * @param Callback Function what get executed before/after/instead when that function runs. 
     * @param options Options for the patcher eg. the type.
     * @returns Function to cancel the patch
     */
    after(caller: string, module: object|Function, moduleName: string, callback: PatcherCallback, options?: PatcherOptions): Function;
}
interface Themes {
    /**
     * Gets the meta of the theme you requsted.
     * @param themeName The name of the theme ou want. for example: ZeresPluginLibrary
     */
    get(themeName: string): Theme;
    /**
     * Returns al list with all themes that are loaded.
     */
    getAll(): Theme[];
    /**
     * Disables the theme that was found with the name you given.
     * @param themeName The name of the theme you want to disable. for example: ClearVersion
     */
    disable(themeName: string): void;
    /**
     * Enables the theme that was found with the name you given.
     * @param themeName The name of the theme you want to disable. for example: ClearVersion
     */
    enable(themeName: string): void;
    /**
     * Checks of the requested theme is enabled.
     * @param themeName The name of the theme you want to enable.
     */
    isEnanled(themeName: string): boolean;
    /**
     * Reloads the theme with the name.
     * @param themeName The name of the theme you want to reload.
     */
    reload(themeName: string): void;
    /**
     * Toggles the state of the theme with that name.
     * @param themeName The name of the theme you want to toggle his state. (enabled/disabled).
     */
    toggle(themeName: string): void
    /**
     * The themes folder where all bd themes are located.
     */
    folder: string
}
interface Plugins {
    /**
     * Gets the instance of the requested plugin.
     * @param pluginName The name of the plugin ou want. for example: ZeresPluginLibrary
     */
    get(pluginName: string): Plugin;
    /**
     * Returns al list with all plugins that are loaded.
     */
    getAll(): Plugin[];
    /**
     * Disables the plugin that was found with the name you given.
     * @param pluginName The name of the plugin you want to disable. for example: ZeresPluginLibrary
     */
    disable(pluginName: string): void;
    /**
     * Enables the plugin that was found with the name you given.
     * @param pluginName The name of the plugin you want to enable. for example:: ZeresPluginLibrary
     */
    enable(pluginName: string): void;
    /**
     * Checks of the requested plugin is enabled.
     * @param pluginName The name of the plugin which you're aksing for.
     */
    isEnabled(pluginName: string): boolean;
    /**
     * Reloads the plugin with the name.
     * @param pluginName The name of the plugin you want to reload.
     */
    reload(pluginName: string): void;
    /**
     * Toggles the state of the plugin with that name.
     * @param pluginName The name of the plugin you want to toggle his state. (enabled/disabled).
     */
    toggle(pluginName: string): void
    /**
     * The plugins folder where all bd plugins are located.
     */
    folder: string
}

interface ConfirmModalOptions {
    onConfirm?: () => void
    onCancel?: () => void
    danger?: boolean
    confirmText?: string
    cancelText?: string
}

declare namespace BdApi {

    /**
     * Saves the config data for plugins.
     * @param pluginName Name of the plugin for the config file, will be completed to **PLUGINNAME.config.json**
     * @param key key for the data
     * @param data Defines under which category the data should be saved. 
     */
    function saveData(pluginName: string, key: string, data: any): void;

    /**
     * Loads the config data for plugins.
     * @param pluginName Name of the plugin for the config file, will be completed to **PLUGINNAME.config.json**
     * @param key the category you want to load. For example "settings" 
     */
    function loadData(pluginName: string, key: string): any;

    /**
     * Alias for `BdApi.saveData`, saves the config data for plugins.
     * @param pluginName Name of the plugin for the config file, will be completed to **PLUGINNAME.config.json**
     * @param key key for the data
     * @param data Defines under which category the data should be saved. 
     */
    function setData(pluginName: string, key: string, data: any): void;

    /**
     * Alias for `BdApi.loadData`, loads the config data for plugins.
     * @param pluginName Name of the plugin for the config file, will be completed to **PLUGINNAME.config.json**
     * @param key the category you want to get. For example "settings" 
     */
    function getData(pluginName: string, key: string): any;

    /**
     * Deletes a propety in the plugin configfile.
     * @param pluginName Name of the plugin, will be completed to PLUGINNAME.config.json
     * @param key The key in the configfile object.
     */
    function deleteData(pluginName: string, key: string): void;

    /**
     * Injects CSS stylesheet into discord's dom tree.
     * @param styleId Id to clear the stylesheet
     * @param css The css stylesheet which should be loaded.
     */
    function injectCSS(styleId: string, css: string): void;

    /**
     * Clears the stylesheet of plugins.
     * @param styleId Id of the styleelement
     */
    function clearCSS(styleId: string): void;

    /**
     * Opens a alert modal with a title and body in the discord client.
     * @param title The title of the alert modal.
     * @param body The body of the alert modal.
     * @returns Modal id.
     */
    function alert(title: string|any, body: string|any): string

    /**
     * Find any module of discord's internal modules.
     * @param filter function which process the module and returns true/false if the modules is the right one.
     */
    function findModule(filter: ModuleFilter): any|void;

    /**
     * Find all modules of discord's internal modules that matches the filter.
     * @param filter function which process the module and returns true/false if the modules is the right one.
     */
    function findAllModules(filter: ModuleFilter): any[];

    /**
     * Returns any found module by his keys or undefined.
     * @param properties A list of keys the module has. for example you search for the module with `{name, get, put}` you put as filter `BdApi.findModuleByProps("name", "get");`
    */
    function findModuleByProps(...properties: string[]): any|void;

    /**
     * Returns any found module/function with that displayName.
     * @param displayName Displayname of the function.
     */
    function findModuleByDisplayName(displayName: string): any;

    /**
     * Show a confirmation modal in discord that the user can agree or cancel.
     * @param title Title for the confirm modal
     * @param body Body for the confirm modal
     * @param options Options for the modal. See autocomplete for entries.
     */
    function showConfirmationModal(title: any, body: any, options: ConfirmModalOptions): string;
    
    /**
     * Returns any module that was found by his prototype keys.
     * @param prototypes Prototype keys of the module.
     */
    function findModuleByPrototypes(...prototypes: string[]): any|void;

    const Patcher: Patcher;

    /**
     * Plugin API to control plugins.
     */
    const Plugins: Plugins

    /**
     * Theme API to control themes.
     */
    const Themes: Themes;

    /**
     * Instance of React.
     */
    const React: typeof import("react");

    /**
     * Instance of ReactDOM.
     */
    const ReactDOM: typeof import("react-dom");

    /**
     * BD's current version.
     */
    const version: string;

    /**
     * Path to discord's window config file.
     */
    const WindowConfigFile: string;
    
    function monkeyPatch(module: any, functionName: string, options: {
        before: ({returnValue: any, methodArguments: IArguments}) => any,
        after: ({returnValue: any, methodArguments: IArguments}) => any,
        instead: ({returnValue: any, methodArguments: IArguments}) => any;
    }): () => void;
}

declare module "betterdiscord/api" {
    export default BdApi;
}