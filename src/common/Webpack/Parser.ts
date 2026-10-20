import { Webpack } from "@api";

import type { ParserType } from "../../types/discord";
import { lazyExport } from "./lazy";

export const Parser = lazyExport<ParserType>(() => Webpack.getByKeys("parseTopic"));
