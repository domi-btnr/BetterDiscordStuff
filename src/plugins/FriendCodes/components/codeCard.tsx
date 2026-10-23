import { Components } from "@api";
import { Parser } from "@common/Webpack";

import { Trans, useTranslation } from "../modules/i18n";
import type { FriendInvite } from "../types";
import styles from "./codeCard.scss";
import CopyButton from "./copyButton";

const { Flex, Text } = Components;

interface FriendCodeRowProps {
    invite: FriendInvite;
}

export default function FriendCodeRow({ invite }: FriendCodeRowProps) {
    const { t } = useTranslation();
    const expiresAt = new Date(invite.expires_at!).getTime() / 1000;

    return (
        <Flex className={styles.friendCodesRow} align={Flex.Align.CENTER} justify={Flex.Justify.BETWEEN}>
            <div>
                <Text tag="h4" size={Text.Sizes.SIZE_16} color={Text.Colors.HEADER_PRIMARY} strong>
                    {invite.code}
                </Text>
                <Text className={styles.friendCodesRowDetails} color={Text.Colors.MUTED}>
                    <Trans
                        i18nKey="card.details"
                        values={{ uses: invite.uses, maxUses: invite.max_uses }}
                        components={{ expires: <>{Parser.parse(`<t:${expiresAt}:R>`)}</> }}
                    />
                </Text>
            </div>
            <CopyButton
                copyText={t("card.copy")}
                copiedText={t("card.copied")}
                onClick={() => DiscordNative.clipboard.copy(`https://discord.gg/${invite.code}`)}
            />
        </Flex>
    );
}
