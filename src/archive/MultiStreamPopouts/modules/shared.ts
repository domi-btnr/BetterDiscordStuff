import { Webpack } from "@api";

export const WINDOW_KEY = (streamKey: string) => `DISCORD_STREAM_POPUP_${streamKey}`;

export const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", { searchExports: true });
export const PopoutWindowStore = Webpack.Stores.PopoutWindowStore;
