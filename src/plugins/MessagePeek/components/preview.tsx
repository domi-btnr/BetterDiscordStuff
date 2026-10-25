import { Components, Hooks } from "@api";
import ErrorBoundary from "@common/ErrorBoundary";
import { Settings } from "@common/Settings";
import { Parser } from "@common/Webpack";
import { type ComponentProps, type ComponentType, type ReactNode, useLayoutEffect, useMemo, useRef } from "react";

import { useTranslation } from "../modules/i18n";
import { getMessagePreview, useLastMessage } from "../modules/messages";
import { trackList, updateList } from "../modules/rowHeight";
import { UserStore } from "../modules/webpack";
import type { Location } from "../types";
import styles from "./preview.scss";

export const Tooltip = Components.Tooltip as ComponentType<
    Omit<ComponentProps<typeof Components.Tooltip>, "text"> & { text: ReactNode }
>;

interface PreviewProps {
    channelId: string;
    location: Location;
}

function PreviewText({ channelId, location }: PreviewProps) {
    const { t } = useTranslation();
    const settings = Hooks.useStateFromStores(
        [Settings] as any,
        () => ({
            enabled: Settings.get(location === "dm" ? "showInDMs" : "showInGuilds", true),
            showAuthor: Settings.get("showAuthor", true),
            showYourselfAsYou: Settings.get("showYourselfAsYou", true),
            charLimit: Settings.get("tooltipCharacterLimit", 256)
        }),
        [location],
        true
    );
    const message = useLastMessage(channelId);
    const content = settings.enabled && message ? getMessagePreview(message) : undefined;
    const ref = useRef<HTMLDivElement>(null);
    const list = useRef<any>(undefined);
    const hadContent = useRef(!!content);

    useLayoutEffect(() => {
        if (ref.current) list.current = trackList(ref.current, location);
        if (hadContent.current !== !!content && list.current) updateList(list.current);
        hadContent.current = !!content;
    }, [!!content]);

    const tooltip = useMemo(() => {
        if (!content) return;
        const { charLimit } = settings;
        return Parser.parse(content.length > charLimit ? `${content.slice(0, charLimit).trim()}…` : content);
    }, [content, settings.charLimit]);
    const text = useMemo(() => content && Parser.parseInlineReply(content), [content]);

    if (!message || !content) return null;

    const { author } = message;
    const isYou = settings.showYourselfAsYou && author.id === UserStore.getCurrentUser()?.id;
    const authorName = isYou ? t("you") : author.globalName || author.username;

    return (
        <div ref={ref} className={styles.messagePeekPreview}>
            <Tooltip text={tooltip}>
                {props => (
                    <div {...props} className={styles.messagePeekPreviewText}>
                        {settings.showAuthor && `${authorName}: `}
                        {text}
                    </div>
                )}
            </Tooltip>
        </div>
    );
}

export default function Preview(props: PreviewProps) {
    return (
        <ErrorBoundary id="MessagePeek.Preview" mini>
            <PreviewText {...props} />
        </ErrorBoundary>
    );
}
