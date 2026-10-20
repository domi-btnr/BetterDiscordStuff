import { Webpack } from "@api";

import type { FluxType } from "../../types/discord";

export const Flux: FluxType = Webpack.getByKeys("Store")!;
