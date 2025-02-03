import "./styles.scss";

import { Components, Webpack } from "@api";
import React from "react";

import Settings from "../modules/settings";
import { useStateFromStores } from "../modules/shared";

const MessageStore = Webpack.getStore("MessageStore");
const ChannelWrapperStyles = Webpack.getByKeys("muted", "subText");
const ChannelStyles = Webpack.getByKeys("closeButton", "subtext");
const Parser = Webpack.getByKeys("parseTopic");
const i18n = Webpack.getByKeys("getLocale");

export default function MessagePeek({ channelId, timestampOnly }) {
    if (!channelId) return null;

    const lastMessage = useStateFromStores([MessageStore], () => MessageStore.getMessages(channelId)?.last());
    if (!lastMessage) return null;

    if (!timestampOnly) {
        const attachmentCount = lastMessage.attachments.length;
        const content =
            lastMessage.content ||
            lastMessage.embeds?.[0]?.rawDescription ||
            lastMessage.stickerItems.length && "Sticker" ||
            attachmentCount && `${attachmentCount} attachment${attachmentCount > 1 ? "s" : ""}`;
        if (!content) return null;

        const charLimit = Settings.get("tooltipCharacterLimit", 256);

        return (
            <div
                className={ChannelWrapperStyles.subText}
                style={{ marginBottom: "2px" }}
            >
                <Components.Tooltip text={
                    content.length > charLimit ?
                        Parser.parse(content.slice(0, charLimit).trim() + "…")
                        : Parser.parse(content)
                }
                >
                    {props => (
                        <div
                            {...props}
                            className={ChannelStyles.subtext}
                        >
                            {Settings.get("showAuthor", true) && `${lastMessage.author["globalName"] || lastMessage.author["username"]}: `}
                            {Parser.parseInlineReply(content)}
                        </div>
                    )}
                </Components.Tooltip>
            </div>
        );
    } else {
        const now = Date.now();
        const dateTimeFormatter = new Intl.DateTimeFormat(i18n.getLocale(), {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        const units = [
            { unit: "s", ms: 1000 },
            { unit: "m", ms: 1000 * 60 },
            { unit: "h", ms: 1000 * 60 * 60 },
            { unit: "d", ms: 1000 * 60 * 60 * 24 },
            { unit: "w", ms: 1000 * 60 * 60 * 24 * 7 },
            { unit: "mo", ms: 1000 * 60 * 60 * 24 * 30 },
            { unit: "y", ms: 1000 * 60 * 60 * 24 * 365 }
        ];

        const diffInMs = lastMessage.timestamp - now;
        let relativeTime = 0;
        let unit = "";
        for (let i = units.length - 1; i >= 0; i--) {
            const { unit: u, ms } = units[i];
            if (Math.abs(diffInMs) >= ms) {
                relativeTime = Math.floor(diffInMs / ms);
                unit = u;
                break;
            }
        }
        return (
            <Components.Tooltip
                text={dateTimeFormatter.format(lastMessage.timestamp)}
            >
                {props => (
                    <div
                        {...props}
                        style={{
                            marginRight: "5px",
                            color: "var(--channels-default)"
                        }}
                    >
                        {`${Math.abs(relativeTime)}${unit}`}
                    </div>
                )}
            </Components.Tooltip>
        );
    }
}
