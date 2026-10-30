import { Webpack } from "@api";
import type { Fiber, ModuleWithKey } from "@typings";

import { lazyExport } from "../Webpack";

interface ReactReconciler {
    enqueueConcurrentRenderForLane(fiber: Fiber, lane: number): object | null;
    scheduleUpdateOnFiber(root: object, fiber: Fiber, lane: number): void;
}

const ReactReconciler = lazyExport<ReactReconciler>(() =>
    Webpack.getBySource(".errorRecoveryDisabledLanes|=", {
        mapDeclarations: true,
        map: {
            enqueueConcurrentRenderForLane: fn =>
                /^function \w+\(\w+,\w+\)\{return \w+\(\w+,null,null,\w+\),\w+\(\w+\)\}$/.test(String(fn)),
            scheduleUpdateOnFiber: fn => String(fn).includes(".cancelPendingCommit)&&(")
        }
    })
);

/**
 * React's `SyncLane`, its highest priority, so the component renders right away. Queuing and scheduling the render
 * have to use the same lane, otherwise Discord stops rendering new components.
 */
const SYNC_LANE = 2;

/**
 * React's `ForceUpdateForLegacySuspense` fiber flag. A fiber with it counts as changed, so it renders even when its
 * props are the same, which a memoized component would otherwise skip.
 */
const FORCE_UPDATE = 131072;

/** Re-renders `fiber`, even when its props didn't change. */
function forceUpdate(fiber: Fiber) {
    const { enqueueConcurrentRenderForLane, scheduleUpdateOnFiber } = ReactReconciler;
    if (!enqueueConcurrentRenderForLane || !scheduleUpdateOnFiber) return;

    fiber.flags |= FORCE_UPDATE;
    if (fiber.alternate) fiber.alternate.flags |= FORCE_UPDATE;
    const root = enqueueConcurrentRenderForLane(fiber, SYNC_LANE);
    if (root) scheduleUpdateOnFiber(root, fiber, SYNC_LANE);
}

/**
 * BetterDiscord's patch wrappers keep the function they replaced in `__originalFunction`. This unwraps it, so a
 * component and all its patched versions lead to the same function.
 * @returns The unpatched function behind `component`.
 */
const getOriginal = (component: any) => component?.__originalFunction ?? component;

/**
 * Re-renders every mounted `component` in Discord's React tree that `filter` matches, as `component` is now. Call it
 * right after patching or unpatching: mounted components keep the function they were created with, so the change would
 * otherwise only show once they mount again.
 * @param component The component, or the `[module, key]` it's exported under, like the ones `withKey` finds.
 */
export function rerenderComponent(component: ModuleWithKey | unknown, filter?: (fiber: Fiber) => boolean) {
    if (Array.isArray(component)) component = component[0]?.[component[1]];
    const original = getOriginal(component);
    if (typeof original !== "function") return;

    const container = document.getElementById("app-mount") as (HTMLElement & Record<string, Fiber>) | null;
    const key = container && Object.keys(container).find(key => key.startsWith("__reactContainer$"));
    const root = key ? container[key] : undefined;

    const stack = [root?.stateNode?.current ?? root];
    while (stack.length) {
        const fiber = stack.pop();
        if (!fiber) continue;
        stack.push(fiber.sibling, fiber.child);
        if (getOriginal(fiber.type) !== original || (filter && !filter(fiber))) continue;

        for (const version of [fiber, fiber.alternate]) {
            if (!version) continue;
            if (version.elementType === version.type) version.elementType = component;
            version.type = component;
        }
        forceUpdate(fiber);
    }
}
