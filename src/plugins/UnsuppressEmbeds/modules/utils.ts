type MenuChild = React.ReactElement<{ id?: string }>;

type MenuGroup = React.ReactElement<{
    children: MenuChild[];
}>;

export function findGroupById(res: React.ReactElement, id: string): MenuGroup | null {
    if (!res) return null;

    let children = (res.props as { children?: MenuChild | MenuChild[] })?.children;
    if (!children) return null;

    if (!Array.isArray(children)) children = [children];

    if (children.some(child => child && typeof child === "object" && "props" in child && child.props?.id === id))
        return res as MenuGroup;

    for (const child of children)
        if (child && typeof child === "object") {
            const found = findGroupById(child, id);
            if (found) return found;
        }

    return null;
}
