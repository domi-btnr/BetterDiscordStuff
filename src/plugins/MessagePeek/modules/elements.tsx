import { Logger, Utils } from "@api";

import type { WrapperProps } from "../types";

export const findInTree = (tree: any, filter: (node: any) => boolean) =>
    Utils.findInTree(tree, filter, { walkable: ["children", "props"] });

export const findByClassName = (tree: any, className: string) =>
    findInTree(tree, node => typeof node?.props?.className === "string" && node.props.className.startsWith(className));

function MessagePeek({ __original: original, __patch: patch, ...props }: WrapperProps) {
    const res = original(props);
    try {
        patch(res);
    } catch (error) {
        Logger.error("Failed to patch", original, error);
    }
    return res;
}

export const isWrapped = (element: any) => element?.type === MessagePeek;

export function patchRender(element: any, patch: (res: any) => void) {
    if (typeof element?.type !== "function" || isWrapped(element)) return;
    element.props = { ...element.props, __original: element.type, __patch: patch };
    element.type = MessagePeek;
}
