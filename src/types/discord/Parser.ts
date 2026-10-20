import type { Parser as VencordParser } from "@vencord/discord-types";
import type { ReactNode } from "react";

export type ParserType = VencordParser & {
    parseTruncatedTopic(
        content: string,
        inline?: boolean,
        state?: Record<string, any>,
        options?: Record<string, any>
    ): ReactNode[];
    guildEventLocationRules: Record<string, Record<"react" | "html" | "parse" | "match" | "order", any>>;
};
