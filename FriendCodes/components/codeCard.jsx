import React from "react";
import { Components, Webpack } from "@api";

import styles from "./style.scss";
import CopyButton from "./copyButton";
import { DiscordComponents } from "../modules/shared";

const { Flex } = Components;
const { FormTitle } = DiscordComponents
const { clipboard } = DiscordNative;
const Parser = Webpack.getByKeys("parseTopic");

export default function FriendCodeCard({ invite }) {
    return (
        <div className={styles.card}>
            <Flex justify={Flex.Justify.START}>
                <div className={styles.cardTitle}>
                    <FormTitle tag="h4" style={{ textTransform: "none" }}>
                        {invite.code}
                    </FormTitle>
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
    )
} 