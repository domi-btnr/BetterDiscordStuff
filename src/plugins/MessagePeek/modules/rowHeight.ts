import { ReactUtils } from "@api";

import type { Location } from "../types";
import { hasPreview } from "./messages";

type GetRowHeight = (section: number, row: number) => number;

const EXTRA_HEIGHT: Record<Location, number> = { dm: 8, guild: 16 };

const originals = new WeakMap<any, GetRowHeight>();
const lists = new Set<WeakRef<any>>();
const pendingUpdates = new Set<any>();
let tracking = false;
let frame: number | undefined;

function getChannelId(list: any, location: Location, section: number, row: number): string | undefined {
    if (location === "dm") return section === 1 ? list.props.privateChannelIds?.[row] : undefined;

    const { guildChannels } = list.props;
    try {
        if (!guildChannels || guildChannels.isPlaceholderRow(section, row)) return;
        return guildChannels.getChannelFromSectionRow(section, row)?.channel?.id;
    } catch {
        return undefined;
    }
}

export function updateList(list: any) {
    pendingUpdates.add(list);
    frame ??= requestAnimationFrame(() => {
        frame = undefined;
        pendingUpdates.forEach(list => list.forceUpdate());
        pendingUpdates.clear();
    });
}

export function trackList(node: Element, location: Location) {
    if (!tracking) return;

    let fiber = ReactUtils.getInternalInstance(node);
    while (fiber && typeof fiber.stateNode?.getRowHeight !== "function") fiber = fiber.return;
    const list = fiber?.stateNode;
    if (!list || originals.has(list)) return list;

    const getRowHeight: GetRowHeight = list.getRowHeight;
    originals.set(list, getRowHeight);
    list.getRowHeight = (section: number, row: number) => {
        const channelId = getChannelId(list, location, section, row);
        const extra = channelId && hasPreview(channelId, location) ? EXTRA_HEIGHT[location] : 0;
        return getRowHeight.call(list, section, row) + extra;
    };

    for (const ref of lists) if (!ref.deref()) lists.delete(ref);
    lists.add(new WeakRef(list));
    updateList(list);
    return list;
}

export function startTracking() {
    tracking = true;
}

export function stopTracking() {
    tracking = false;
    if (frame) cancelAnimationFrame(frame);
    frame = undefined;
    pendingUpdates.clear();

    for (const ref of lists) {
        const list = ref.deref();
        if (!list) continue;
        list.getRowHeight = originals.get(list);
        originals.delete(list);
        list.forceUpdate();
    }
    lists.clear();
}
