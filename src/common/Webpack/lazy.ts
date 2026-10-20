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
