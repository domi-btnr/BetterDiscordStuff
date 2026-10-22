import { Hooks } from "@api";
import { getLocalizedString } from "@common/i18n";
import { Settings } from "@common/Settings";
import type { Stream, User } from "@vencord/discord-types";
import { createElement, Fragment, type ReactNode } from "react";

import type { Spectators } from "../types";
import { ApplicationStreamingStore, ChannelRTCStore, NameUtils, SelectedChannelStore, UserStore } from "./webpack";

export const Strings = {
    SPECTATORS: "BR7Tno",
    NUM_USERS: "3uHFUR",
    USER_LIST: "A+bT9O"
};

const MAX_COMPACT_NAMES = 3;

export const getDisplayName = (user: User, { guildId, channelId }: Spectators) =>
    NameUtils?.getName(guildId, channelId, user) ?? user.globalName ?? user.username;

export function getSpectatorSentence(
    spectators: Spectators,
    renderName: (user: User) => ReactNode = user => getDisplayName(user, spectators)
) {
    const names = spectators.users.slice(0, MAX_COMPACT_NAMES).map(renderName);
    const others = spectators.total - names.length;
    if (others > 0) names.push(getLocalizedString(Strings.NUM_USERS, { num: others }));

    return getLocalizedString(Strings.USER_LIST, {
        users: names.length,
        user1: names[0],
        user2: names[1],
        commaSeparatedUsers: createElement(
            Fragment,
            null,
            ...names.slice(0, -1).flatMap((name, i) => (i ? [", ", name] : [name]))
        ),
        lastUser: names.at(-1)
    });
}

function getWatchedStream(): Stream | null {
    const currentUserId = UserStore.getCurrentUser()?.id;
    const watched = ApplicationStreamingStore.getAllActiveStreams().filter(stream => stream.ownerId !== currentUserId);
    if (!watched.length) return null;

    const channelId = SelectedChannelStore.getVoiceChannelId();
    const selected = channelId ? ChannelRTCStore.getSelectedParticipant(channelId) : null;
    const selectedOwnerId = selected && "stream" in selected ? selected.stream.ownerId : undefined;
    const lastActiveOwnerId = ApplicationStreamingStore.getLastActiveStream()?.ownerId;

    return (
        watched.find(stream => stream.ownerId === selectedOwnerId)
        ?? watched.find(stream => stream.ownerId === lastActiveOwnerId)
        ?? watched[0]
    );
}

function isSameSpectators(a: Spectators | null, b: Spectators | null) {
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.guildId === b.guildId
        && a.channelId === b.channelId
        && a.streamer === b.streamer
        && a.total === b.total
        && a.users.length === b.users.length
        && a.users.every((user, i) => user === b.users[i])
    );
}

export function useSpectators(): Spectators | null {
    return Hooks.useStateFromStores(
        [ApplicationStreamingStore, ChannelRTCStore, SelectedChannelStore, Settings, UserStore] as any,
        () => {
            const stream =
                ApplicationStreamingStore.getCurrentUserActiveStream()
                ?? (Settings.get("showWatchedStream", true) ? getWatchedStream() : null);
            if (!stream) return null;

            const viewerIds = ApplicationStreamingStore.getViewerIds(stream);
            const isOwnStream = stream.ownerId === UserStore.getCurrentUser()?.id;
            return {
                guildId: stream.guildId,
                channelId: stream.channelId,
                streamer: isOwnStream ? undefined : UserStore.getUser(stream.ownerId),
                total: viewerIds.length,
                users: viewerIds.map(id => UserStore.getUser(id)).filter(Boolean)
            };
        },
        [],
        isSameSpectators
    );
}
