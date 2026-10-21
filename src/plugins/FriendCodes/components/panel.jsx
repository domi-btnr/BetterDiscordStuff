import { Components, Hooks, Webpack } from "@api";
import React from "react";

import { InviteModule, TextVariantStyles } from "../modules/shared";
import FriendInvitesStore from "../modules/store";
import FriendCodeCard from "./codeCard";
import styles from "./style.scss";

const { Button, Flex, Text } = Components;
const FormStyles = Webpack.getModule(m => m.header && m.title && Object.keys(m).length === 2);
const { createFriendInvite, getAllFriendInvites, revokeFriendInvites } = InviteModule;

export default function FriendCodesPanel() {
    const invites = Hooks.useStateFromStores([FriendInvitesStore], () => FriendInvitesStore.getInvites());
    const loading = Hooks.useStateFromStores([FriendInvitesStore], () => !FriendInvitesStore.hasLoaded());
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        getAllFriendInvites();
    }, []);

    const runRequest = request => {
        setPending(true);
        request().finally(() => setPending(false));
    };

    return (
        <header className={FormStyles.header}>
            <Text
                tag="h2"
                size={Text.Sizes.SIZE_20}
                variant="heading-lg/semibold"
                className={TextVariantStyles["heading-lg/semibold"]}
            >
                Your Friend Codes
            </Text>

            <Flex style={{ marginBottom: "16px" }} justify={Flex.Justify.BETWEEN}>
                <h2 className={styles.panelHeader}>{`Friend Codes - ${invites.length}`}</h2>
                <Flex justify={Flex.Justify.END}>
                    <Button
                        color={Button.Colors.GREEN}
                        look={Button.Looks.FILLED}
                        disabled={pending}
                        onClick={() => runRequest(createFriendInvite)}
                    >
                        Create Friend Code
                    </Button>
                    <Button
                        style={{ marginLeft: "8px" }}
                        color={Button.Colors.RED}
                        look={Button.Looks.OUTLINED}
                        disabled={pending || !invites.length}
                        onClick={() => runRequest(revokeFriendInvites)}
                    >
                        Revoke all Friend Codes
                    </Button>
                </Flex>
            </Flex>

            <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                {loading ? (
                    <Text variant="heading-md/semibold" className={styles.panelText}>
                        Loading...
                    </Text>
                ) : invites.length === 0 ? (
                    <Text variant="heading-md/semibold" className={styles.panelText}>
                        You don't have any friend codes yet
                    </Text>
                ) : (
                    <div>
                        {invites.map(invite => (
                            <FriendCodeCard key={invite.code} invite={invite} />
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
