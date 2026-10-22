import { Components, Hooks } from "@api";
import ErrorBoundary from "@common/ErrorBoundary";
import { getLocalizedString } from "@common/i18n";
import { Settings } from "@common/Settings";
import { cloneElement, type ComponentProps, type ComponentType, type ReactElement, type ReactNode } from "react";

import { getDisplayName, getSpectatorSentence, Strings, useSpectators } from "../modules/spectators";
import type { Spectators } from "../types";
import styles from "./tooltip.scss";

export const Tooltip = Components.Tooltip as ComponentType<
    Omit<ComponentProps<typeof Components.Tooltip>, "text"> & { text: ReactNode }
>;

interface SpectatorListProps {
    spectators: Spectators;
    showTitle?: boolean;
}

export function SpectatorList({ spectators, showTitle }: SpectatorListProps) {
    const compact = Hooks.useStateFromStores([Settings] as any, () => Settings.get("compactMode", false));
    const { guildId, total, users } = spectators;
    const unknownCount = total - users.length;

    return (
        <>
            {showTitle && (
                <div className={styles.showSpectatorsTooltipTitle}>
                    {getLocalizedString(Strings.SPECTATORS, { numViewers: total })}
                </div>
            )}
            {total > 0
                && (compact ? (
                    <div>{getSpectatorSentence(spectators)}</div>
                ) : (
                    <div className={styles.showSpectatorsTooltipList}>
                        {users.map(user => (
                            <div key={user.id} className={styles.showSpectatorsTooltipRow}>
                                <img
                                    className={styles.showSpectatorsTooltipAvatar}
                                    src={user.getAvatarURL(guildId, 40)}
                                    alt={user.username}
                                />
                                {getDisplayName(user, spectators)}
                            </div>
                        ))}
                        {unknownCount > 0 && (
                            <div className={styles.showSpectatorsTooltipMore}>
                                +{getLocalizedString(Strings.NUM_USERS, { num: unknownCount })}
                            </div>
                        )}
                    </div>
                ))}
        </>
    );
}

function StreamTooltip() {
    const spectators = useSpectators();
    if (!spectators) return null;

    return <SpectatorList showTitle spectators={spectators} />;
}

export function StreamIconTooltip({ children }: { children: ReactElement<any> }) {
    return (
        <Tooltip
            text={
                <ErrorBoundary id="ShowSpectators.Tooltip" mini>
                    <StreamTooltip />
                </ErrorBoundary>
            }
        >
            {props => cloneElement(children, props)}
        </Tooltip>
    );
}
