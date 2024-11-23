import React from "react";
import { Components, Webpack } from "@api";

import { useStateFromStores } from "../modules/shared";
import Settings from "../modules/settings";
import "./styles.scss";

const MessageStore = Webpack.getStore("MessageStore");
const ChannelWrapperStyles = Webpack.getByKeys("muted", "subText");
const ChannelStyles = Webpack.getByKeys("closeButton", "subtext");
const Parser = Webpack.getByKeys("parseTopic");

export default function MessagePeek({ channelId }) {
    if (!channelId) return null;

    const lastMessage = useStateFromStores([MessageStore], () => MessageStore.getMessages(channelId)?.last());
    if (!lastMessage) return null;

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
    )
}