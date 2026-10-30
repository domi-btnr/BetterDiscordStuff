import { Webpack } from "@api";
import type { Flux as FluxType } from "@vencord/discord-types";

export const Flux: FluxType = Webpack.getByKeys("Store")!;
