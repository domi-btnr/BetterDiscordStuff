type MenuGroup = React.ReactElement<{
    children: React.ReactElement[]
}>;

export function findGroupById(res: React.ReactElement, id: string): MenuGroup {
    if (!res) return null;

    let children: Array<React.ReactElement> = res?.props?.children;
    if (!children) return null;

    if (!Array.isArray(children))
        children = [children];

    if (children.some(child =>
        child && typeof child === "object" && "props" in child && child.props.id === id
    )) return res;

    for (const child of children)
        if (child && typeof child === "object") {
            const found = findGroupById(child, id);
            if (found) return found;
        }
}

export function generateStreamKey({ guildId, channelId, ownerId }: { guildId: string, channelId: string, ownerId: string }) {
    return `guild:${guildId}:${channelId}:${ownerId}`;
}
