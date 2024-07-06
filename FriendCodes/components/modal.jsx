import React from "react";
import { Webpack } from "@api";

import styles from "./style.scss";

const { DiscordNative: { clipboard: { copy } } } = Webpack.getByKeys("DiscordNative");
const { Button, Heading, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize } = Webpack.getByKeys("ModalContent");
const { createFriendInvite, getAllFriendInvites, revokeFriendInvites } = Webpack.getByKeys("createFriendInvite");
const Flex = Webpack.getByStrings(".HORIZONTAL", ".START");
const Markdown = Webpack.getByKeys("parseTopic");

// Copy Button from Strencher
// https://github.com/Strencher/BetterDiscordStuff/blob/development/ShowSessions/components/list.tsx#L25-L44
function CopyButton({ copyText, copiedText, onClick }) {
    const [copied, setCopied] = React.useState(false);

    const handleButtonClick = e => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
        onClick(e);
    };

    return (
        <Button
            onClick={handleButtonClick}
            color={copied ? Button.Colors.GREEN : Button.Colors.BRAND}
            size={Button.Sizes.SMALL}
            look={Button.Looks.FILLED}
        >
            {copied ? copiedText : copyText}
        </Button>
    );
}

function InviteCard(props) {
    return (
        <div className={styles.item}>
            <div className={styles.code}>
                <span><b>Code:</b> {Markdown.parse(`\`${props.invite.code}\``)}</span>
            </div>
            <div className={styles.uses}>
                <span><b>Uses:</b> {props.invite.uses}/{props.invite.max_uses}</span>
            </div>
            <div className={styles.expiresAt}>
                <span><b>Expires in:</b> {Markdown.parse(`<t:${Math.floor(Date.parse(props.invite.expires_at).toString().slice(0, -3))}:R>`)}</span>
            </div>
            <div className={styles.buttonContainer}>
                <div className={styles.buttonContainerInner}>
                    <CopyButton
                        copiedText="Copied!"
                        copyText="Copy"
                        onClick={() => copy(`https://discord.gg/${props.invite.code}`)}
                    />
                </div>
            </div>
        </div>
    );
}

export default function Modal(props) {
    const [invites, setInvites] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
        setLoading(true);
        getAllFriendInvites().then(invites => setInvites(invites)).then(() => setLoading(false));
    }, []);
    return (
        <ModalRoot {...props} size={ModalSize.MEDIUM}>
            <ModalHeader separator={false}>
                <Heading level="2" variant="heading-lg/medium">Friend Codes</Heading>
            </ModalHeader>
            <ModalContent>
                {
                    loading ? <div className={styles.loading} /> :
                        invites.length > 0 ?
                            invites.map(invite => <InviteCard key={invite.code} invite={invite} />) :
                            <div className={styles.noInvites}>
                                <img src="https://discord.com/assets/b36c705f790dad253981f1893085015a.svg" draggable={false} />
                                <Heading level="3" variant="heading-lg/small">You don't have any friend codes yet</Heading>
                            </div>
                }
            </ModalContent>
            <ModalFooter>
                <Flex justify={Flex.Justify.BETWEEN}>
                    <Flex justify={Flex.Justify.START}>
                        <Button color={Button.Colors.GREEN} look={Button.Looks.OUTLINED} onClick={() => createFriendInvite().then(invite => setInvites([...invites, invite]))}>Create Friend Code</Button>
                        <Flex justify={Flex.Justify.START}>
                            <Button color={Button.Colors.RED} look={Button.Looks.LINK} disabled={!invites.length} onClick={() => revokeFriendInvites().then(setInvites([]))}>Revoke all Friend Codes</Button>
                        </Flex>
                    </Flex>
                    <Button onClick={props.onClose}>Okay</Button>
                </Flex>
            </ModalFooter>
        </ModalRoot>
    );
};