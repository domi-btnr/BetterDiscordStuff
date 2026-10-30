import { Webpack } from "@api";
import type { Parser as ParserType } from "@vencord/discord-types";

import { lazyExport } from "./lazy";

export const Parser = lazyExport<ParserType>(() => Webpack.getByKeys("parseTopic"));
