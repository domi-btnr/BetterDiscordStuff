import { Components } from "@api";
import { useState } from "react";

const { Button } = Components;

interface CopyButtonProps {
    copyText: string;
    copiedText: string;
    onClick: () => void;
}

export default function CopyButton({ copyText, copiedText, onClick }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleButtonClick = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
        onClick();
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
