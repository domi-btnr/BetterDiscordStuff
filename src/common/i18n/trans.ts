import { cloneElement, createElement, Fragment, type ReactElement, type ReactNode } from "react";

const TAG_REGEX = /<(\w+)\s*\/>|<(\w+)>(.*?)<\/\2>/s;

/**
 * Replaces the tags in `message` with `components`: `<name/>` renders the element as is, `<name>text</name>` passes `text` as its children.
 * @param fill Applied to every text part, e.g. to fill placeholders after the tags are parsed.
 */
export function renderTags(
    message: string,
    components: Record<string, ReactElement<any>>,
    fill: (text: string) => string
): ReactNode {
    const parts = message.split(TAG_REGEX);
    const children: ReactNode[] = [];

    for (let i = 0; i < parts.length; i += 4) {
        if (parts[i]) children.push(fill(parts[i]));

        const [selfClosing, tag, inner] = parts.slice(i + 1, i + 4);
        const component = components[selfClosing ?? tag];
        if (selfClosing) children.push(component ? cloneElement(component, { key: i }) : `<${selfClosing}/>`);
        else if (tag) children.push(component ? cloneElement(component, { key: i }, fill(inner)) : fill(inner));
    }

    return createElement(Fragment, null, ...children);
}
