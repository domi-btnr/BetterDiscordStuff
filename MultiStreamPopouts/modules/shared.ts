import { Webpack } from "@api";

export const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", { searchExports: true });
export const PopoutWindowStore = Webpack.Stores.PopoutWindowStore;
