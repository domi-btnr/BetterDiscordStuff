import { Hooks } from "@api";
import ErrorBoundary from "@common/ErrorBoundary";
import { useLocale } from "@common/i18n";
import { Settings } from "@common/Settings";
import { useEffect, useState } from "react";

import { useTranslation } from "../modules/i18n";
import { useLastMessage } from "../modules/messages";
import type { Location } from "../types";
import { Tooltip } from "./preview";
import styles from "./timestamp.scss";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS = [
    ["year", 365 * DAY],
    ["month", 30 * DAY],
    ["week", 7 * DAY],
    ["day", DAY],
    ["hour", HOUR],
    ["minute", MINUTE],
    ["second", SECOND]
] as const;

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * How long ago `timestamp` was in the largest fitting unit, like `5m`. Instead of ticking, it re-renders once
 * when the shown value changes, at most once a day.
 */
function useRelativeTime(timestamp: number | undefined) {
    const [tick, setTick] = useState(0);
    const elapsed = timestamp === undefined ? 0 : Math.max(0, Date.now() - timestamp);
    const [unit, ms] = UNITS.find(([, ms]) => elapsed >= ms) ?? UNITS[UNITS.length - 1];

    useEffect(() => {
        if (timestamp === undefined) return;
        const timeout = setTimeout(() => setTick(count => count + 1), Math.min(ms - (elapsed % ms), DAY));
        return () => clearTimeout(timeout);
    }, [tick, timestamp]);

    return timestamp === undefined ? undefined : { value: Math.floor(elapsed / ms), unit };
}

function formatDate(timestamp: number, locale: string) {
    let formatter = dateFormatters.get(locale);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        dateFormatters.set(locale, formatter);
    }
    return formatter.format(timestamp);
}

interface TimestampProps {
    channelId: string;
    location: Location;
}

function LastMessageTimestamp({ channelId, location }: TimestampProps) {
    const { t } = useTranslation();
    const locale = useLocale();
    const enabled = Hooks.useStateFromStores(
        [Settings] as any,
        () =>
            Settings.get(location === "dm" ? "showInDMs" : "showInGuilds", true) && Settings.get("showTimestamp", true),
        [location]
    );
    const message = useLastMessage(channelId);
    const timestamp = message && Number(message.timestamp);
    const relativeTime = useRelativeTime(timestamp);
    if (!enabled || timestamp === undefined || !relativeTime) return null;

    return (
        <Tooltip text={formatDate(timestamp, locale)}>
            {props => (
                <div {...props} className={styles.messagePeekTimestamp}>
                    {t(`units.${relativeTime.unit}`, { value: relativeTime.value })}
                </div>
            )}
        </Tooltip>
    );
}

export default function Timestamp(props: TimestampProps) {
    return (
        <ErrorBoundary id="MessagePeek.Timestamp" mini>
            <LastMessageTimestamp {...props} />
        </ErrorBoundary>
    );
}
