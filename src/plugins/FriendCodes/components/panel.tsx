import { Components, Hooks, Logger, UI } from "@api";
import ErrorBoundary from "@common/ErrorBoundary";
import { useEffect, useState } from "react";

import { useTranslation } from "../modules/i18n";
import FriendInvitesStore, { fetchInvites } from "../modules/store";
import { InviteModule } from "../modules/webpack";
import FriendCodeRow from "./codeCard";
import styles from "./panel.scss";

const { Button, Flex, Spinner, Text } = Components;

function PanelContent() {
    const { t } = useTranslation();
    const invites = Hooks.useStateFromStores([FriendInvitesStore] as any, () => FriendInvitesStore.getInvites());
    const loaded = Hooks.useStateFromStores([FriendInvitesStore] as any, () => FriendInvitesStore.hasLoaded());
    const failed = Hooks.useStateFromStores([FriendInvitesStore] as any, () => FriendInvitesStore.hasFailed());

    if (!loaded && failed) {
        return (
            <div className={styles.friendCodesPanelEmpty}>
                <Text color={Text.Colors.MUTED}>{t("panel.loadFailed")}</Text>
                <Button size={Button.Sizes.SMALL} onClick={fetchInvites}>
                    {t("panel.retry")}
                </Button>
            </div>
        );
    }

    if (!loaded) {
        return (
            <div className={styles.friendCodesPanelEmpty}>
                <Spinner />
            </div>
        );
    }

    if (!invites.length) {
        return (
            <div className={styles.friendCodesPanelEmpty}>
                <Text color={Text.Colors.MUTED}>{t("panel.empty")}</Text>
            </div>
        );
    }

    return invites.map(invite => <FriendCodeRow key={invite.code} invite={invite} />);
}

function PanelBody() {
    const { t } = useTranslation();
    const count = Hooks.useStateFromStores([FriendInvitesStore] as any, () => FriendInvitesStore.getInvites().length);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        fetchInvites();
    }, []);

    const runRequest = (request: () => Promise<unknown>, error: "errors.create" | "errors.revoke") => {
        setPending(true);
        request()
            .catch(err => {
                Logger.error(error, err);
                UI.showToast(t(error), { type: "error" });
            })
            .finally(() => setPending(false));
    };

    return (
        <>
            <Flex className={styles.friendCodesPanelHeader} align={Flex.Align.START} justify={Flex.Justify.BETWEEN}>
                <div className={styles.friendCodesPanelHeading}>
                    <Text tag="h2" size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY} strong>
                        {t("panel.title")}
                    </Text>
                    <Text className={styles.friendCodesPanelDescription}>{t("panel.description")}</Text>
                </div>
                <Flex className={styles.friendCodesPanelActions} justify={Flex.Justify.END}>
                    <Button
                        className={styles.friendCodesPanelRevoke}
                        color={Button.Colors.RED}
                        look={Button.Looks.OUTLINED}
                        size={Button.Sizes.SMALL}
                        disabled={pending || !count}
                        onClick={() => runRequest(InviteModule.revokeFriendInvites, "errors.revoke")}
                    >
                        {t("panel.revokeAll")}
                    </Button>
                    <Button
                        size={Button.Sizes.SMALL}
                        disabled={pending}
                        onClick={() => runRequest(InviteModule.createFriendInvite, "errors.create")}
                    >
                        {t("panel.create")}
                    </Button>
                </Flex>
            </Flex>

            <Text
                tag="h3"
                className={styles.friendCodesPanelCount}
                size={Text.Sizes.SIZE_12}
                color={Text.Colors.HEADER_SECONDARY}
                strong
            >
                {t("panel.count", { count })}
            </Text>
            <div className={styles.friendCodesPanelList}>
                <PanelContent />
            </div>
        </>
    );
}

export default function FriendCodesPanel() {
    return (
        <header className={styles.friendCodesPanel}>
            <ErrorBoundary id="FriendCodes.Panel">
                <PanelBody />
            </ErrorBoundary>
        </header>
    );
}
