import { Webpack } from "@api";

import type { I18nModuleType } from "../../types/discord";
import { lazyExport } from "./lazy";

export const I18nModule = lazyExport<I18nModuleType>(() => Webpack.getModule(m => m.intl));
