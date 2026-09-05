/// <reference types="@betterdiscord/types" />

declare module "@api" {
    export const Commands: BetterDiscord.BoundCommandAPI;
    export const Components: BetterDiscord.Components;
    export const ContextMenu: BetterDiscord.ContextMenu;
    export const Data: BetterDiscord.BoundData;
    export const DOM: BetterDiscord.BoundDOM;
    export const Hooks: BetterDiscord.BoundHooks;
    export const Logger: BetterDiscord.BoundLogger;
    export const Net: BetterDiscord.Net;
    export const Patcher: BetterDiscord.BoundPatcher;
    export const Plugins: BetterDiscord.AddonAPI;
    export const ReactUtils: BetterDiscord.ReactUtils;
    export const Themes: BetterDiscord.AddonAPI;
    export const UI: BetterDiscord.UI;
    export const Utils: BetterDiscord.Utils;
    export const Webpack: BetterDiscord.Webpack;
}

declare module "@styles" {
    const styles: {
        load(): void;
        unload(): void;
        sheets: string[];
        _element: HTMLElement | null;
    };
    export default styles;
}

declare module "@manifest" {
    interface ChangelogItem {
        title: string;
        type: "added" | "changed" | "fixed" | "improved";
        items: string[];
    }

    export interface Manifest {
        name: string;
        version: string;
        description?: string;
        author: string;
        authorId: string;
        invite?: string;
        donate?: string;
        source?: string;
        changelog?: ChangelogItem[];
        changelogDate?: string;
        changelogImage?: string;
    }

    const manifest: Manifest;
    export default manifest;
}

declare module "*.scss";
