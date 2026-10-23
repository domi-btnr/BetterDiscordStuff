import { Components } from "@api";
import manifest from "@manifest";
import { type ReactNode, type SVGProps, useEffect, useState } from "react";

import { createI18n } from "../i18n";
import de from "./locales/de.json";
import en from "./locales/en.json";
import styles from "./style.scss";

const { Button, ErrorBoundary: BdErrorBoundary, Text } = Components;

const { Trans, useTranslation } = createI18n({
    resources: { en, de },
    discord: {
        title: "+XstB0",
        retry: "TdQXA8",
        copied: "q30c5i"
    }
});

interface Key {
    label: string;
    name?: "keys.command" | "keys.option";
}

const STACK_FRAMES = 2;
const CONSOLE_KEYS: Key[] = navigator.userAgent.includes("Mac")
    ? [{ label: "⌘", name: "keys.command" }, { label: "⌥", name: "keys.option" }, { label: "I" }]
    : [{ label: "Ctrl" }, { label: "Shift" }, { label: "I" }];

/**
 * @returns The error line and the first few stack frames with file names instead of full URLs,
 * e.g. `"Error: …\n    at FriendCodeRow (FriendCodes.plugin.js:901:33)"`.
 */
function getShortStack(error: Error): string {
    const lines = error.stack?.split("\n") ?? [];
    const frames = lines
        .filter(line => line.trimStart().startsWith("at "))
        .slice(0, STACK_FRAMES)
        .map(line => line.replace(/[^\s()]*\/([^/\s()]+:\d+:\d+)/g, "$1"));
    return [`${error.name}: ${error.message}`, ...frames].join("\n");
}

/** Copies with Discord's clipboard bridge, or the browser's when it's missing. */
function copyToClipboard(text: string) {
    if (typeof DiscordNative !== "undefined") DiscordNative.clipboard.copy(text);
    else navigator.clipboard?.writeText(text);
}

interface ErrorBoundaryProps {
    /** Shown in the log and the error details, e.g. `"FriendCodes.Panel"`. */
    id: string;
    /** Renders only a small error icon, for tight spots like tooltips. */
    mini?: boolean;
    children: ReactNode;
}

interface FallbackProps {
    id: string;
    error: Error | null;
    onRetry(): void;
}

const ErrorIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <path d="M12 6.5v7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="1.5" fill="#fff" />
    </svg>
);

function Keybind({ keys }: { keys: Key[] }) {
    const { t } = useTranslation();

    return (
        <span className={styles.errorBoundaryKeybind}>
            {keys.map(({ label, name }) => (
                <kbd key={label}>
                    {name ? (
                        <span className={styles.errorBoundarySymbol} role="img" aria-label={t(name)}>
                            {label}
                        </span>
                    ) : (
                        label
                    )}
                </kbd>
            ))}
        </span>
    );
}

function CopyErrorButton({ id, error }: { id: string; error: Error }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 1000);
        return () => clearTimeout(timeout);
    }, [copied]);

    const copy = () => {
        copyToClipboard(`${manifest.name} v${manifest.version} (${id})\n${error.stack ?? getShortStack(error)}`);
        setCopied(true);
    };

    return (
        <Button size={Button.Sizes.SMALL} color={copied ? Button.Colors.GREEN : Button.Colors.PRIMARY} onClick={copy}>
            {t(copied ? "copied" : "copy")}
        </Button>
    );
}

function MiniFallback() {
    const { t } = useTranslation();
    const label = t("mini", { plugin: manifest.name });

    return (
        <span className={styles.errorBoundaryMini} role="img" aria-label={label} title={label}>
            <ErrorIcon width="16" height="16" />
        </span>
    );
}

function Fallback({ id, error, onRetry }: FallbackProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.errorBoundary} role="alert">
            <div className={styles.errorBoundaryContent}>
                <Text size={Text.Sizes.SIZE_16} color={Text.Colors.HEADER_PRIMARY} strong>
                    {t("title")}
                </Text>
                <Text color={Text.Colors.MUTED}>
                    <Trans
                        i18nKey="description"
                        values={{ plugin: manifest.name }}
                        components={{ keybind: <Keybind keys={CONSOLE_KEYS} /> }}
                    />
                </Text>
                {error && (
                    <code className={styles.errorBoundaryDetails}>
                        [{id}] {getShortStack(error)}
                    </code>
                )}
            </div>
            <div className={styles.errorBoundaryActions}>
                {error && <CopyErrorButton id={id} error={error} />}
                <Button size={Button.Sizes.SMALL} onClick={onRetry}>
                    {t("retry")}
                </Button>
            </div>
        </div>
    );
}

export default function ErrorBoundary({ id, mini, children }: ErrorBoundaryProps) {
    const [error, setError] = useState<Error | null>(null);
    const [attempt, setAttempt] = useState(0);

    const retry = () => {
        setError(null);
        setAttempt(attempt + 1);
    };

    return (
        <BdErrorBoundary
            key={attempt}
            id={id}
            name={manifest.name}
            fallback={mini ? <MiniFallback /> : <Fallback id={id} error={error} onRetry={retry} />}
            onError={setError}
        >
            {children}
        </BdErrorBoundary>
    );
}
