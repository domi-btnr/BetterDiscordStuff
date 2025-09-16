import { Components, Webpack } from "@api";
import React from "react";

import { DiscordComponents, InviteModule } from "../modules/shared";
import FriendCodeCard from "./codeCard";
import styles from "./style.scss";

const { Button, Flex, Text } = Components;
const { FormTitle } = DiscordComponents;
const FormStyles = Webpack.getModule((_, __, id) => id === "979493");
const { createFriendInvite, getAllFriendInvites, revokeFriendInvites } = InviteModule;

export default function FriendCodesPanel() {
    const [invites, setInvites] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        getAllFriendInvites()
            .then(setInvites)
            .then(() => setLoading(false));
    }, []);

    return (
        <header className={FormStyles.header}>
            <FormTitle
                tag="h2"
                className={FormStyles.title}
            >
                Your Friend Codes
            </FormTitle>

            <Flex
                style={{ marginBottom: "16px" }}
                justify={Flex.Justify.BETWEEN}
            >
                <h2 className={styles.panelHeader}>{`Friend Codes - ${invites.length}`}</h2>
                <Flex justify={Flex.Justify.END}>
                    <Button
                        color={Button.Colors.GREEN}
                        look={Button.Looks.FILLED}
                        onClick={() => createFriendInvite().then(invite => setInvites([...invites, invite]))}
                    >
                        Create Friend Code
                    </Button>
                    <Button
                        style={{ marginLeft: "8px" }}
                        color={Button.Colors.RED}
                        look={Button.Looks.OUTLINED}
                        disabled={!invites.length}
                        onClick={() => revokeFriendInvites().then(setInvites([]))}
                    >
                        Revoke all Friend Codes
                    </Button>
                </Flex>
            </Flex>

            <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                {
                    loading ?
                        <Text
                            variant="heading-md/semibold"
                            className={styles.panelText}
                        >
                            Loading...
                        </Text> :
                        invites.length === 0 ?
                            <Text
                                variant="heading-md/semibold"
                                className={styles.panelText}
                            >
                                You don't have any friend codes yet
                            </Text> :
                            <div>
                                {invites.map(invite => (
                                    <FriendCodeCard key={invite.code} invite={invite} />
                                ))}
                            </div>
                }
            </div>
        </header>
    );
}
