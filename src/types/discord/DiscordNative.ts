import type { UntypedFunction, UntypedNamespace } from "./untyped";

export interface DiscordNativeClipboard {
    copy(text: string): void;
    copyFile: UntypedFunction;
    copyImage(image: Uint8Array, url: string): void;
    cut(): void;
    hasMixedContent: UntypedFunction;
    paste(): void;
    read(): string;
}

export interface DiscordNativeApp {
    dock: UntypedNamespace<"bounce" | "cancelBounce" | "setBadge">;
    getAppArch(): string;
    getBuildNumber(): number;
    getDefaultDoubleClickAction: UntypedFunction;
    getModuleVersions(): Record<string, number>;
    getOpenOnStart: UntypedFunction;
    getPath(name: string): Promise<string>;
    getPreferredSystemLanguages(): string[];
    getReleaseChannel(): "stable" | "ptb" | "canary" | "development";
    getSystemUIDirection: UntypedFunction;
    getVersion(): string;
    pauseFrameEvictor: UntypedFunction;
    registerUserInteractionHandler: UntypedFunction;
    relaunch(): void;
    setBadgeCount(count: number): void;
    unpauseFrameEvictor: UntypedFunction;
}

export interface DiscordNativeFileManager extends UntypedNamespace<
    | "checkClipsFilesExist"
    | "checkMLModelFilesExist"
    | "cleanupUnusedClipsFiles"
    | "cleanupUnusedMLModelFiles"
    | "cleanupUnusedOpenH264Files"
    | "createDirectoryIfNotExists"
    | "deleteVoiceMessageRecording"
    | "getAndCreateLogDirectorySync"
    | "getAssetCachePath"
    | "getAssetCachePathSync"
    | "getClipsDataDir"
    | "getClipsDataDirSync"
    | "getClipsSentryDirSync"
    | "getLogPath"
    | "getLogPathSync"
    | "getMLDataDir"
    | "getMLDataDirSync"
    | "getModuleDataPathSync"
    | "getModulePath"
    | "getOpenH264Dir"
    | "getOpenH264LibraryPathSync"
    | "logLevelSync"
    | "maybeDownloadClipsFile"
    | "maybeDownloadMLModelFile"
    | "maybeDownloadOpenH264"
    | "readLogFiles"
    | "readVoiceMessageRecording"
    | "saveWithDialog2"
    | "stopMLModelDownloads"
    | "uploadDiscordHookCrashes"
> {
    OPENH264_LIBRARY_FILE_NAME: string;
    basename(path: string, ext?: string): string;
    dirname(path: string): string;
    extname(path: string): string;
    join(...paths: string[]): string;
    openFiles(options: Record<string, unknown>, maxSize?: number): Promise<File[]>;
    saveWithDialog(data: Uint8Array | string, fileName: string): Promise<void>;
    showItemInFolder(path: string): void;
    showOpenDialog(options: Record<string, unknown>): Promise<string[]>;
}

export interface DiscordNativeWindow extends UntypedNamespace<
    | "getMediaSourceId"
    | "getNativeHandle"
    | "openDocumentPip"
    | "setContentProtection"
    | "setDevtoolsCallbacks"
    | "setFocusable"
    | "setFrameRate"
    | "setMinimumSize"
    | "setWindowContentProtection"
    | "showInactive"
    | "supportsContentProtection"
> {
    blur(key?: string): void;
    close(key?: string): void;
    flashFrame(flag: boolean): void;
    focus(key?: string): void;
    fullscreen(key?: string): void;
    isAlwaysOnTop(key?: string): Promise<boolean>;
    maximize(key?: string): void;
    minimize(key?: string): void;
    restore(key?: string): void;
    setAlwaysOnTop(key: string | undefined, enabled: boolean): void;
    setBackgroundThrottling(enabled: boolean): void;
    setProgressBar(progress: number, key?: string): void;
    setZoomFactor(factor: number): void;
}

export interface DiscordNativeType {
    accessibility: { isAccessibilitySupportEnabled(): Promise<boolean> };
    activityCapture: UntypedNamespace<
        "captureImage" | "captureStream" | "onPausedChanged" | "onStopped" | "stop" | "update"
    >;
    app: DiscordNativeApp;
    clipboard: DiscordNativeClipboard;
    clips: UntypedNamespace<
        | "debugListStashedClipDeciderSessions"
        | "debugReadStashedClipDeciderData"
        | "debugStashClipDeciderData"
        | "deleteClip"
        | "getClipProtocolURLFromPath"
        | "loadClip"
        | "loadClipsDirectory"
        | "moveClip"
        | "renderMontageRecipe"
        | "updateClipMetadata"
    >;
    crashReporter: UntypedNamespace<
        "getFlattenedMetadata" | "getMetadata" | "triggerJSException" | "updateCrashReporter"
    >;
    cs2Gsi: UntypedNamespace<"debugLogCs2GsiPayload" | "deleteCs2GsiConfig" | "readCs2GsiToken" | "writeCs2GsiConfig">;
    desktopCapture: UntypedNamespace<"getDesktopCaptureSources">;
    dotaGsi: UntypedNamespace<
        "debugLogDotaGsiPayload" | "deleteDotaGsiConfig" | "readDotaGsiToken" | "writeDotaGsiConfig"
    >;
    features: {
        declareSupported(feature: string): void;
        supports(feature: string): boolean;
    };
    fileManager: DiscordNativeFileManager;
    frameDebugger: UntypedNamespace<"attach" | "detach" | "onDetached" | "onInput" | "runBatch">;
    frameView: UntypedNamespace<
        | "capture"
        | "create"
        | "destroy"
        | "enter"
        | "onCursor"
        | "onExit"
        | "onFocus"
        | "onLoad"
        | "onMessage"
        | "onUnder"
        | "postMessage"
        | "sendInput"
        | "setColorScheme"
        | "setLayout"
        | "setOnTop"
    >;
    gcEvents: UntypedNamespace<"addGCListener">;
    gpuSettings: {
        getEnableHardwareAcceleration(): boolean;
        setChromiumSwitches: UntypedFunction;
        setEnableHardwareAcceleration(enabled: boolean): void;
    };
    hardware: { getDisplayCount(): number };
    http: UntypedNamespace<"getAPIEndpoint" | "makeChunkedRequest">;
    ipc: {
        invoke(channel: string, ...args: unknown[]): Promise<any>;
        on(channel: string, listener: (...args: any[]) => void): void;
        send(channel: string, ...args: unknown[]): void;
    };
    isRenderer: boolean;
    nativeModules: {
        canBootstrapNewUpdater: boolean;
        ensureModule(name: string): Promise<void>;
        getModulePath: UntypedFunction;
        requireModule(name: string): any;
    };
    ntpClock: UntypedNamespace<"getOffsetMs" | "getSyncInfo" | "now" | "onSync" | "start">;
    os: {
        appArch: string;
        arch: string;
        buildRevision: string | null;
        release: string;
    };
    powerMonitor: {
        getSystemIdleTimeMs(): number;
        on(event: string, listener: (...args: any[]) => void): void;
        removeAllListeners(event?: string): void;
    };
    powerSaveBlocker: UntypedNamespace<"blockDisplaySleep" | "cleanupDisplaySleep" | "unblockDisplaySleep">;
    process: {
        arch: string;
        env: Record<string, string | undefined>;
        pid: number;
        platform: "win32" | "darwin" | "linux";
    };
    processUtils: UntypedNamespace<
        | "disablePAMemoryProfiler"
        | "disableProfilingV8Heap"
        | "enablePAMemoryProfiler"
        | "enableProfilingV8Heap"
        | "flushCookies"
        | "flushDNSCache"
        | "flushStorageData"
        | "getBlinkMemoryInfo"
        | "getCPUCoreCount"
        | "getCpuUsageElectronProcessTypeDetails"
        | "getCumulativeCPUUsage"
        | "getCurrentCPUUsagePercent"
        | "getGpuProcessId"
        | "getHeapStats"
        | "getLastCrash"
        | "getMainArgvSync"
        | "getPartitionAllocatorStats"
        | "getPerfAttributedPAMemory"
        | "getPerfAttributedPAMemoryCallstacks"
        | "getProcessUptime"
        | "getProfilerV8MemoryCallstacks"
        | "getSystemInfo"
        | "getSystemMetrics"
        | "getUsedHeapSize"
        | "purgeMemory"
        | "setCrashInformation"
        | "setCrashReason"
        | "setMemoryInformation"
    >;
    riotGames: UntypedNamespace<"fetchLiveClientData">;
    rocketLeagueStatsApi: UntypedNamespace<
        "debugLogRocketLeagueStatsApiMessage" | "readRocketLeagueStatsApiConfig" | "writeRocketLeagueStatsApiConfig"
    >;
    safeStorage: {
        decryptString(encrypted: string): string;
        encryptString(plain: string): string;
        isEncryptionAvailable(): boolean;
    };
    setUncaughtExceptionHandler: UntypedFunction;
    settings: {
        get(key: string, defaultValue?: unknown): Promise<any>;
        getSync(key: string, defaultValue?: unknown): any;
        set(key: string, value: unknown): void;
    };
    spellCheck: UntypedNamespace<
        | "getAvailableDictionaries"
        | "on"
        | "replaceMisspelling"
        | "setLearnedWords"
        | "setLocale"
        | "setSpellCheckerLanguages"
    >;
    sysimg: UntypedNamespace<
        "canConvertHeic" | "canConvertJxr" | "convertBytes" | "getBackendName" | "getCapabilities"
    >;
    thumbar: UntypedNamespace<"setThumbarButtons">;
    tracing: UntypedNamespace<"capturePerformanceTrace" | "saveTraceToDownloads">;
    userDataCache: UntypedNamespace<"cacheUserData" | "deleteCache" | "getCached">;
    webAuthn: UntypedNamespace<
        | "signalAllAcceptedCredentials"
        | "signalCurrentUserDetails"
        | "signalUnknownCredential"
        | "webAuthnAuthenticate"
        | "webAuthnRegister"
    >;
    window: DiscordNativeWindow;
}
