import React from "react";

import { isSubmitting, subscribeSubmitting } from "../modules/shared";

export default function EditComposerLock({ channelId, children }: { channelId: string; children: React.ReactNode }) {
    const submitting = React.useSyncExternalStore(subscribeSubmitting, () => isSubmitting(channelId));
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (submitting && containerRef.current?.contains(document.activeElement)) {
            (document.activeElement as HTMLElement).blur();
        }
    }, [submitting]);

    return (
        <div ref={containerRef} style={submitting ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
            {children}
        </div>
    );
}
