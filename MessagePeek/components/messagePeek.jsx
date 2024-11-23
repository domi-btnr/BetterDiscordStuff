import React from "react";
import { Components, Webpack } from "@api";

import "./styles.scss";

const useStateFromStores = Webpack.getByStrings("useStateFromStores", { searchExports: true });
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

    return (
        <div
            className={ChannelWrapperStyles.subText}
            style={{ marginBottom: "2px" }}
        >
            <Components.Tooltip text={content.length > 256 ? Parser.parse(content.slice(0, 256).trim()) : Parser.parse(content)}>
                {props => (
                    <div
                        {...props}
                        className={ChannelStyles.subtext}
                    >
                        {`${lastMessage.author["globalName"] || lastMessage.author["username"]}: `}
                        {Parser.parseInlineReply(content)}
                    </div>
                )}
            </Components.Tooltip>
        </div>
    )
}