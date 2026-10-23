import type { Command } from "../types";
import createFriendCode from "./createFriendCode";
import revokeAllFriendCodes from "./revokeAllFriendCodes";

export default function getCommands(): Command[] {
    return [createFriendCode(), revokeAllFriendCodes()];
}
