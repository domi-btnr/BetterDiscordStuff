/**
 * Wraps a module lookup so it only runs on first use. Reads and writes go to the real module, so it can be patched.
 * @param getter Looks up the module. Runs again on the next access as long as it returns nothing.
 * @returns A stand-in for the module.
 */
export function lazyExport<T extends object>(getter: () => T | undefined | void): T {
    let cached: T | undefined;
    const resolve = () => (cached ??= getter() || undefined) as Record<PropertyKey, unknown> | undefined;

    return new Proxy({} as T, {
        get: (_, key) => resolve()?.[key],
        set: (_, key, value) => {
            const target = resolve();
            if (target) target[key] = value;
            return true;
        },
        has: (_, key) => key in (resolve() ?? {}),
        ownKeys: () => Reflect.ownKeys(resolve() ?? {}),
        getOwnPropertyDescriptor: (_, key) => {
            const descriptor = Reflect.getOwnPropertyDescriptor(resolve() ?? {}, key);
            return descriptor && { ...descriptor, configurable: true };
        }
    });
}
