import { Webpack } from "@api";
import type { FluxDispatcher } from "@vencord/discord-types";

export const Dispatcher: FluxDispatcher = Webpack.getByKeys("dispatch", "subscribe", "_actionHandlers", {
    searchExports: true
})!;
