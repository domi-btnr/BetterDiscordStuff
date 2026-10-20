/**
 * Wraps a module lookup so it only runs on first use. Reads and writes go to the real module.
 * @param getter Looks up the module. Only runs once, even if it finds nothing.
 * @returns A stand-in for the module.
 */
export function lazyExport<T extends object>(getter: () => T | undefined | void): T {
    let resolved = false;
    let cached: Record<PropertyKey, unknown> | undefined;
    const resolve = () => {
        if (!resolved) {
            cached = (getter() || undefined) as Record<PropertyKey, unknown> | undefined;
            resolved = true;
        }
        return cached;
    };

    return new Proxy({} as T, {
        get: (_, key) => resolve()?.[key],
        set: (_, key, value) => {
            const target = resolve();
            if (!target) return false;
            target[key] = value;
            return true;
        },
        defineProperty: (_, key, descriptor) => {
            const target = resolve();
            return !!target && Reflect.defineProperty(target, key, descriptor);
        },
        deleteProperty: (_, key) => {
            const target = resolve();
            return !!target && Reflect.deleteProperty(target, key);
        },
        has: (_, key) => key in (resolve() ?? {}),
        ownKeys: () => Reflect.ownKeys(resolve() ?? {}),
        getOwnPropertyDescriptor: (_, key) => {
            const descriptor = Reflect.getOwnPropertyDescriptor(resolve() ?? {}, key);
            return descriptor && { ...descriptor, configurable: true };
        }
    });
}
