import type { ActionHandlers, Flux as VencordFlux, FluxDispatcher, FluxStore } from "@vencord/discord-types";
import type { ComponentType } from "react";

/**
 * Priority band of a store's action handlers. Lower bands run first.
 * - `0`: Early
 * - `1`: Database
 * - `2`: Default
 */
export type DispatchBand = 0 | 1 | 2;

export interface PersistedStoreClearOptions {
    type: "all" | "user-data-only";
    /** Persist keys that are not cleared. */
    omit?: string[];
}

export interface PersistedStore extends FluxStore {
    _version: number;
    getClass(): PersistedStoreClass;
    /**
     * Initializes the store from its persisted state.
     * @param state The persisted state, if there is one.
     * @returns `true` to persist the state again right away.
     */
    initialize(state?: unknown): boolean | void;
    /** @returns The full state of the store, which gets persisted. */
    getState(): unknown;
    initializeFromState(state: unknown): void;
    asyncPersist(): Promise<boolean>;
    persist(): void;
    clear(): void;
}

export interface PersistedStoreClass extends Omit<typeof FluxStore, "prototype"> {
    new (dispatcher: FluxDispatcher, actionHandlers?: ActionHandlers, band?: DispatchBand): PersistedStore;
    persistKey: string;
    migrations?: ((state: unknown) => unknown)[];
    throttleDelay: number;
    disableWrite: boolean;
    disableWrites: boolean;
    allPersistKeys: Set<string>;
    userAgnosticPersistKeys: Set<string>;
    _writePromises: Map<string, Promise<boolean>>;
    _writeResolvers: Map<string, [resolve: (persisted: boolean) => void, idleCallbackId: number]>;
    _clearAllPromise?: Promise<void> | null;
    displayName?: string;
    initialized: Promise<void>;
    removeAllConditionalListeners(): void;
    clearAll(options: PersistedStoreClearOptions): Promise<void>;
    shouldClear(options: PersistedStoreClearOptions, persistKey: string): boolean;
    clearPersistQueue(options: PersistedStoreClearOptions): void;
    /** @returns The persisted state of every store, keyed by persist key. */
    getAllStates(): Promise<Record<string, unknown>>;
    initializeAll(states: Record<string, unknown>): void;
    destroy(): void;
    migrateAndReadStoreState(
        persistKey: string,
        migrations?: ((state: unknown) => unknown)[]
    ): { state: unknown; requiresPersist: boolean };
}

/** A persisted store whose state is kept across accounts. Its `getState` returns `getUserAgnosticState`. */
export interface UserAgnosticStore extends PersistedStore {
    getUserAgnosticState(): unknown;
}

export interface UserAgnosticStoreClass extends PersistedStoreClass {
    new (dispatcher: FluxDispatcher, actionHandlers?: ActionHandlers, band?: DispatchBand): UserAgnosticStore;
}

export interface FluxType extends VencordFlux {
    PersistedStore: PersistedStoreClass;
    DeviceSettingsStore: UserAgnosticStoreClass;
    OfflineCacheStore: UserAgnosticStoreClass;
    connectStores<P extends object, S extends object>(
        stores: FluxStore[],
        getStateFromStores: (props: P) => S,
        options?: { forwardRef?: boolean }
    ): (component: ComponentType<P & S>) => ComponentType<P>;
    initialize(): void;
    initialized: Promise<void>;
}
