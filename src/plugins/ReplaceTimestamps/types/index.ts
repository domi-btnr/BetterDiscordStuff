export type CreateForumPost = (content: string, stickerIds?: string[], files?: unknown[]) => Promise<unknown>;

export type DateOrder = "day" | "month";

export type TimestampKind = "time" | "date" | "dateTime";

export type TimestampStyle = "short" | "long" | "relative";

export interface TimestampGroups {
    hours?: string;
    minutes?: string;
    meridiem?: string;
    date?: string;
}
