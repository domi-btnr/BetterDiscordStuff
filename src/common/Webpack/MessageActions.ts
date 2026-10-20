import { Webpack } from "@api";

import type { MessageActionsType } from "../../types/discord";
import { lazyExport } from "./lazy";

export const MessageActions = lazyExport<MessageActionsType>(() => Webpack.getByKeys("sendMessage", "editMessage"));
