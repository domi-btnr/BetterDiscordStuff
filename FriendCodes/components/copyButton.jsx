import React from "react";

import { DiscordCompononents } from "../modules/shared";

const { Button } = DiscordCompononents;

// Copy Button from Strencher
// https://github.com/Strencher/BetterDiscordStuff/blob/development/ShowSessions/components/list.tsx#L25-L44
export default function CopyButton({ copyText, copiedText, onClick }) {
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