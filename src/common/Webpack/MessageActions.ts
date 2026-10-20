import { Webpack } from "@api";

import type { MessageActionsType } from "../../types/discord";

export const MessageActions: MessageActionsType = Webpack.getByKeys("sendMessage", "editMessage")!;
