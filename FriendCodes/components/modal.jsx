import { useState, useEffect } from "react";
import { WebpackModules, Toasts } from "@zlibrary";
import { ModalContent, ModalFooter, ModalHeader, ModalRoot } from "@discord/modal";
import { Button, Flex } from "@discord/components";
const { Heading } = WebpackModules.getByProps("Heading") ?? { Heading: () => null };
import { copy } from "@discord/native";
import styles from "./style.css";

const { createFriendInvite, getAllFriendInvites, revokeFriendInvites } = WebpackModules.getByProps("createFriendInvite");
const Markdown = WebpackModules.getByProps("parseTopic");

function InviteCard(props) {
    return (
        <div className={styles.item}>
            <b>{props.invite.code}</b>
            <div className={styles.uses}>
                <span>Uses: <b>{props.invite.uses}/{props.invite.max_uses}</b></span>
            </div>
            <div className={styles.expiresAt}>
                <span>Expires in: {Markdown.parse(`<t:${Math.floor(Date.parse(props.invite.expires_at).toString().slice(0, -3))}:R>`)}</span>
            </div>
            <div className={styles.buttonContainer}>
                <div className={styles.buttonContainerInner}>
                    <Button size={Button.Sizes.SMALL} onClick={() => {
                        copy(`https://discord.gg/${props.invite.code}`);
                        Toasts.info("Copied to clipboard!");
                    }}>Copy</Button>
                </div>
            </div>
        </div>
    );
}

export default function Modal(props) {
    const [invites, setInvites] = useState([]);
    useEffect(() => {
        getAllFriendInvites().then(invites => setInvites(invites));
    }, []);
    return (
        <ModalRoot {...props} size={"medium"}>
            <ModalHeader separator={false}>
                <Heading level="2" variant="heading-lg/medium">Friend Codes</Heading>
            </ModalHeader>
            <ModalContent>
                {
                    invites.map(invite =>
                        <InviteCard
                            key={invite.code}
                            invite={invite}
                        />
                    )
                }
            </ModalContent>
            <ModalFooter>
                <Flex justify={Flex.Justify.BETWEEN}>
                    <Flex justify={Flex.Justify.START}>
                        <Button color={Button.Colors.GREEN} onClick={() => createFriendInvite().then(getAllFriendInvites().then(invites => setInvites(invites)))}>Create Friend Invite</Button>
                        <Flex justify={Flex.Justify.START}>
                            <Button color={Button.Colors.RED} onClick={() => revokeFriendInvites().then(getAllFriendInvites().then(invites => setInvites(invites)))}>Revoke all Friend Invites</Button>
                        </Flex>
                    </Flex>
                    <Button onClick={props.onClose}>Okay</Button>
                </Flex>
            </ModalFooter>
        </ModalRoot>
    );
};