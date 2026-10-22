import type { User } from "@vencord/discord-types";
import type { ComponentType, JSX, MouseEvent, ReactNode, Ref, RefObject } from "react";

export type AvatarComponent = ComponentType<{
    "src": string;
    "size": `SIZE_${number}`;
    "ref"?: Ref<any>;
    "aria-label"?: string;
}>;

export type AvatarStyles = Record<"clickableAvatar" | "moreUsers", string>;

export type ClickableComponent = ComponentType<{
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    children: ReactNode;
    [key: string]: unknown;
}>;

export interface InteractionProps {
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    [key: string]: unknown;
}

export type ModuleWithKey = [module: Record<string, any>, key: string];

export interface NameUtils {
    getName(guildId: string | null | undefined, channelId: string | null | undefined, user: User): string;
}

export interface Spectators {
    guildId: string | null;
    channelId: string;
    streamer?: User;
    total: number;
    users: User[];
}

export type UserPopoutComponent = ComponentType<{
    targetElementRef: RefObject<HTMLElement | null>;
    userId: string;
    guildId?: string | null;
    position?: "top" | "bottom" | "left" | "right";
    align?: "top" | "bottom" | "left" | "right" | "center";
    children: (props: Record<string, unknown>) => ReactNode;
}>;

export interface UserProfileActions {
    openUserProfileModal(options: { userId: string; guildId?: string | null }): void;
}

export type UserSummaryItemComponent = ComponentType<{
    className?: string;
    users: User[];
    count?: number;
    max?: number;
    renderIcon?: boolean;
    showDefaultAvatarsForNullUsers?: boolean;
    renderUser?: (user: User) => ReactNode;
    renderMoreUsers?: (label: string, count: number) => ReactNode;
}>;
