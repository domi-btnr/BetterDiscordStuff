import { Components, Webpack } from "@api";
import React from "react";

import { TextVariantStyles } from "../modules/shared";
import CopyButton from "./copyButton";
import styles from "./style.scss";

const { Flex, Text } = Components;
const { clipboard } = DiscordNative;
const Parser = Webpack.getByKeys("parseTopic");

export default function FriendCodeCard({ invite }) {
    return (
        <div className={styles.card}>
            <Flex justify={Flex.Justify.START}>
                <div className={styles.cardTitle}>
                    <Text
                        tag="h4"
                        size={Text.Sizes.SIZE_16}
                        variant="heading-md/semibold"
                        className={TextVariantStyles["heading-md/semibold"]}
                    >
                        {invite.code}
                    </Text>
                    <span>
                        Expires {Parser.parse(`<t:${new Date(invite.expires_at).getTime() / 1000}:R>`)} • {invite.uses}/{invite.max_uses} uses
                    </span>
                </div>
                <Flex justify={Flex.Justify.END}>
                    <CopyButton
                        copyText="Copy"
                        copiedText="Copied!"
                        onClick={() => clipboard.copy(`https://discord.gg/${invite.code}`)}
                    />
                </Flex>
            </Flex>
        </div>
    );
}
