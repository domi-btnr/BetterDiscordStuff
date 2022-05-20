declare module "styles" {
    export function inject(): void;
    export function remove(): void;
}

declare module "common/classes/settings" {
    export default class SettingsManager<T> {
        constructor(pluginName: string, defaultSettings?: T);
        settings: T;
        get<T = any>(key: string, defaultValue?: T): T;
        set(key: string, value: any): void;
    }
}

declare module "common/classes/updater";
declare module "common/hooks/zustand";
declare module "common/hooks/createUpdateWrapper";
declare module "common/hooks/useForceUpdate";
declare module "common/util/any";
declare module "common/util/findInTree";
declare module "common/util/findInReactTree";
declare module "common/util/noerror";
declare module "common/util/prevent";
declare module "common/util/regex";
declare module "common/util/resolve";
declare module "common/apis/clyde";
declare module "common/apis/strings";
declare module "common/apis/commands";
declare module "react-spring";
declare module "lodash";

declare module "*.scss";