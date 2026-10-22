/** A webpack export and the key it's stored under, as returned by `withKey: true`. Spread it into `Patcher` calls. */
export type ModuleWithKey = [module: Record<string, any>, key: string];
