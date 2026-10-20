import type { ActionHandlers, FluxDispatcher, FluxEvent } from "@vencord/discord-types";

import type { DispatchBand } from "./Flux";

export interface DispatcherType extends FluxDispatcher {
    _waitQueue: (() => void)[];
    _processingWaitQueue: boolean;
    _currentDispatchActionType: string | null;
    _sentryUtils?: { addBreadcrumb(breadcrumb: { message: string; data?: Record<string, unknown> }): void };
    actionLogger: unknown;
    functionCache: Record<string, (event: FluxEvent) => void>;

    dispatchForStoreTest(event: FluxEvent, storeName: string): void;
    flushWaitQueue(): void;
    _dispatchWithDevtools(event: FluxEvent): void;
    _dispatchWithLogging(event: FluxEvent): void;
    _dispatch(event: FluxEvent, trace: (name: string, callback: () => unknown) => unknown): false | void;
    /**
     * Registers a store's action handlers.
     * @param name The name of the store.
     * @param actionHandlers The handlers, keyed by action type.
     * @param storeDidChange Called after a handler of this store ran.
     * @param band The priority band of the handlers. Defaults to `DispatchBand.Default`.
     * @returns The dispatch token of the registered handlers.
     */
    register(
        name: string,
        actionHandlers: ActionHandlers,
        storeDidChange: (event: FluxEvent) => void,
        band?: DispatchBand
    ): string;
    addDependencies(dispatchToken: string, dependencies: string[]): void;
}
