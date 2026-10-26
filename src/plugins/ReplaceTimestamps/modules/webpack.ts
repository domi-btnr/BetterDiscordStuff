import { Webpack } from "@api";
import type { ModuleWithKey } from "@typings";

/** The hook behind the forum post form. Its callback creates the post through the API instead of using `sendMessage`. */
export const useCreateForumPost = Webpack.getModule<ModuleWithKey>(
    Webpack.Filters.byStrings("use_nested_fields", "applied_tags"),
    { searchExports: true, withKey: true, cacheId: "ReplaceTimestamps.useCreateForumPost" }
);
