import { Webpack } from "@api";

import type { DispatcherType } from "../../types/discord";

export const Dispatcher: DispatcherType = Webpack.getByKeys("dispatch", "subscribe", "_actionHandlers", {
    searchExports: true
})!;
