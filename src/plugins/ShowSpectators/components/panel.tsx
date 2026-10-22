import { Components, Hooks } from "@api";
import { getLocalizedString } from "@common/i18n";
import { Settings } from "@common/Settings";

import { getSpectatorSentence, Strings, useSpectators } from "../modules/spectators";
import { AvatarStyles, UserSummaryItem, WindowStore } from "../modules/webpack";
import type { Spectators } from "../types";
import styles from "./panel.scss";
import { SpectatorAvatar, SpectatorName } from "./spectator";
import { SpectatorList, Tooltip } from "./tooltip";

const { Text } = Components;

const MAX_AVATARS = 12;

interface SpectatorAvatarsProps {
    spectators: Spectators;
    openFullProfile: boolean;
}

function SpectatorAvatars({ spectators, openFullProfile }: SpectatorAvatarsProps) {
    const isFocused = Hooks.useStateFromStores([WindowStore] as any, () => WindowStore.isFocused());
    const { total, users } = spectators;
    const shownCount = users.length === MAX_AVATARS ? MAX_AVATARS : Math.min(users.length, MAX_AVATARS - 1);
    const hidden = { ...spectators, users: users.slice(shownCount), total: total - shownCount };

    return (
        <UserSummaryItem
            className={styles.showSpectatorsPanelContent}
            users={users}
            count={total}
            renderIcon={false}
            max={MAX_AVATARS}
            renderUser={user => (
                <SpectatorAvatar
                    key={user.id}
                    user={user}
                    spectators={spectators}
                    openFullProfile={openFullProfile}
                    animate={isFocused}
                />
            )}
            renderMoreUsers={() =>
                hidden.total > 0 && (
                    <Tooltip text={<SpectatorList spectators={hidden} />}>
                        {props => (
                            <div {...props} className={AvatarStyles.moreUsers}>
                                +{hidden.total}
                            </div>
                        )}
                    </Tooltip>
                )
            }
        />
    );
}

function Panel() {
    const openFullProfile = Hooks.useStateFromStores([Settings] as any, () => Settings.get("openFullProfile", false));
    const compact = Hooks.useStateFromStores([Settings] as any, () => Settings.get("compactMode", false));
    const spectators = useSpectators();
    if (!spectators) return null;

    const { total } = spectators;
    return (
        <div className={styles.showSpectatorsPanel}>
            <Text size={Text.Sizes.SIZE_16}>{getLocalizedString(Strings.SPECTATORS, { numViewers: total })}</Text>
            {total > 0
                && (compact ? (
                    <Text className={styles.showSpectatorsPanelContent}>
                        {getSpectatorSentence(spectators, user => (
                            <SpectatorName
                                key={user.id}
                                user={user}
                                spectators={spectators}
                                openFullProfile={openFullProfile}
                            />
                        ))}
                    </Text>
                ) : (
                    <SpectatorAvatars spectators={spectators} openFullProfile={openFullProfile} />
                ))}
        </div>
    );
}

export function SpectatorsPanel() {
    const showPanel = Hooks.useStateFromStores([Settings] as any, () => Settings.get("showPanel", true));
    return showPanel ? <Panel /> : null;
}
