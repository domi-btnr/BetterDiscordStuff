/** A webpack export and the key it's stored under, as returned by `withKey: true`. Spread it into `Patcher` calls. */
export type ModuleWithKey = [module: Record<string, any>, key: string];

/** A node of React's internal tree. It's the `Fiber` from `@types/react-reconciler`, which BetterDiscord's types use. */
export type Fiber = NonNullable<ReturnType<BetterDiscord.ReactUtils["getInternalInstance"]>>;
