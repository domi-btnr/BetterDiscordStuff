/// <reference path="../common.d.ts" />
/// <reference path="./globals.d.ts" />
// TODO: Finish this

declare namespace DiscordNative {
    /* Constants */
    type SupportedFeatures = "user_data_cache" | "popout_windows" | "voice_panning" | "voice_multiple_connections" | "media_devices" | "media_video" | "debug_logging" | "set_audio_device_by_id" | "set_video_device_by_id" | "loopback" | "experiment_config" | "remote_locus_network_control" | "connection_replay" | "simulcast" | "simulcast_bugfix" | "direct_video" | "electron_video" | "soundshare" | "voice_legacy_subsystem" | "wumpus_video" | "hybrid_video" | "elevated_hook" | "soundshare_loopback" | "screen_previews" | "window_previews" | "audio_debug_state" | "video_effects" | "voice_experimental_subsystem" | "create_host_on_attach";

    export const isRenderer: boolean;

    export const accessibility: {
        isAccessibilitySupportEnabled: () => Promise<boolean>;
    };

    export const app: {
        getPath: (path: "home" | "appData" | "desktop" | "documents" | "downloads" | "crashDumps") => Promise<string>;
        registerUserInteractionHandler: (elementId: string, eventType: DocumentEventMap, callback: (event: Event) => any) => () => void;
        getReleaseChannel: () => ValueOf<DiscordReleaseChannels>;
        setBadgeCount: (count: number) => Promise<void>;
        getModuleVersions: () => DiscordNativeModules;
        getVersion: () => string;
        relaunch: () => void;
        /**Broken, just bails out. */
        getDefaultDoubleClickAction: UnknownFunction;
        dock: {
            bounce: UnknownFunction;
            cancelBounce: UnknownFunction;
            setBadge: UnknownFunction;
        };
    };

    export const clipboard: {
        copyImage: (imageArrayBuffer: ArrayBuffer, imageSrc: string) => void;
        copy: (text: string) => void;
        paste: () => void;
        read: () => void;
        cut: () => void;
    };

    export const crashReporter: {
        getMetadata: () => any,
        updateCrashReporter: () => Promise<any>;
    };

    export const desktopCapture: {
        getDesktopCaptureSources: (options: any) => Promise<any[]>;
    };

    export const features: {
        supports: (feature: SupportedFeatures) => boolean;
        declareSupported: (feature: string) => void;
    };

    export const fileManager: {
        basename: (path: string, ext: string) => string;
        dirname: (path: string) => string;
        extname: (path: string) => string;
        getModulePathDataSync: UnknownFunction;
        saveWithDialog: (options: { title: string, properties: "openDirectory" }) => Promise<{ filePaths: string[] }>;
    };
}