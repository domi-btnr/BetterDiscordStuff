import { Webpack } from "@api";

export const useStateFromStores = Webpack.getByStrings("useStateFromStores", { searchExports: true });
export const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", { searchExports: true });
export const PopoutWindowStore = Webpack.Stores.PopoutWindowStore;
