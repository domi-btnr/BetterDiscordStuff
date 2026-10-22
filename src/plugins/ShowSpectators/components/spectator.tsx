import { Logger } from "@api";
import { Settings } from "@common/Settings";
import type { User } from "@vencord/discord-types";
import { type ReactNode, type RefObject, useRef } from "react";

import { getDisplayName } from "../modules/spectators";
import { Avatar, AvatarStyles, Clickable, UserPopout, UserProfileActions } from "../modules/webpack";
import type { InteractionProps, Spectators } from "../types";
import styles from "./spectator.scss";
import { Tooltip } from "./tooltip";

if (!UserPopout) {
    const fallback = Settings.get("openFullProfile", false) ? "" : ", falling back to the full profile";
    Logger.error(`Failed to find UserPopout module${fallback}`);
}

interface SpectatorProps {
    user: User;
    spectators: Spectators;
    openFullProfile: boolean;
}

interface ProfilePopoutProps extends SpectatorProps {
    children: (props: InteractionProps, ref: RefObject<any>) => ReactNode;
}

function ProfilePopout({ user, spectators, openFullProfile, children }: ProfilePopoutProps) {
    const ref = useRef<HTMLElement>(null);
    const { guildId } = spectators;

    if (openFullProfile || !UserPopout) {
        return children({ onClick: () => UserProfileActions?.openUserProfileModal({ userId: user.id, guildId }) }, ref);
    }

    return (
        <UserPopout targetElementRef={ref} userId={user.id} guildId={guildId} position="top" align="center">
            {popoutProps => children(popoutProps, ref)}
        </UserPopout>
    );
}

interface SpectatorAvatarProps extends SpectatorProps {
    animate: boolean;
}

export function SpectatorAvatar({ user, spectators, openFullProfile, animate }: SpectatorAvatarProps) {
    return (
        <Tooltip text={getDisplayName(user, spectators)}>
            {(tooltipProps: InteractionProps) => (
                <ProfilePopout user={user} spectators={spectators} openFullProfile={openFullProfile}>
                    {(props, ref) => (
                        <Clickable
                            {...tooltipProps}
                            {...props}
                            className={AvatarStyles.clickableAvatar}
                            onClick={event => {
                                tooltipProps.onClick?.(event);
                                props.onClick?.(event);
                            }}
                        >
                            <Avatar
                                ref={ref}
                                src={user.getAvatarURL(spectators.guildId, 48, animate)}
                                size="SIZE_24"
                                aria-label={user.username}
                            />
                        </Clickable>
                    )}
                </ProfilePopout>
            )}
        </Tooltip>
    );
}

export function SpectatorName({ user, spectators, openFullProfile }: SpectatorProps) {
    return (
        <ProfilePopout user={user} spectators={spectators} openFullProfile={openFullProfile}>
            {(props, ref) => (
                <Clickable {...props} tag="span" className={styles.showSpectatorsName}>
                    <span ref={ref}>{getDisplayName(user, spectators)}</span>
                </Clickable>
            )}
        </ProfilePopout>
    );
}
