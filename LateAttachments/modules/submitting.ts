const submittingChannels = new Set<string>();
const submittingListeners = new Set<() => void>();

export function isSubmitting(channelId: string): boolean {
    return submittingChannels.has(channelId);
}

export function subscribeSubmitting(listener: () => void): () => void {
    submittingListeners.add(listener);
    return () => submittingListeners.delete(listener);
}

export function notifySubmittingListeners() {
    submittingListeners.forEach(listener => listener());
}

export function setSubmitting(channelId: string, submitting: boolean) {
    if (submitting) submittingChannels.add(channelId);
    else submittingChannels.delete(channelId);
    notifySubmittingListeners();
}
