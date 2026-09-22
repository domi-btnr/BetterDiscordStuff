import React from "react";

import { isSubmitting, subscribeSubmitting } from "../modules/shared";

export default function EditFormHint({
    channelId,
    originalHint
}: {
    channelId: string;
    originalHint: React.ReactElement;
}) {
    const submitting = React.useSyncExternalStore(subscribeSubmitting, () => isSubmitting(channelId));
    return submitting ? null : originalHint;
}
