import { Webpack } from "@api";
import type { RestAPI as RestAPIType } from "@vencord/discord-types";

import { lazyExport } from "./lazy";

export const RestAPI = lazyExport<RestAPIType>(() =>
    Webpack.getModule(m => typeof m === "object" && m.del && m.put, { searchExports: true })
);
