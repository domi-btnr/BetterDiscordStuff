/** A function whose signature is unknown, e.g. one bridged from Discord's desktop preload. */
export type UntypedFunction = (...args: any[]) => any;

/** An object of functions with known names but unknown signatures. */
export type UntypedNamespace<K extends string> = Record<K, UntypedFunction>;
