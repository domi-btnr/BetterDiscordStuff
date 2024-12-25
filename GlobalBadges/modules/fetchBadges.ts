import { BadgeCache } from "../types/index";

export const API_URL = "https://api.domi-btnr.dev/clientmodbadges";

const cache = new Map<string, BadgeCache>();
const EXPIRES = 1000 * 60 * 15;

export async function fetchBadges(id: string): Promise<BadgeCache["badges"] | undefined> {
    const cachedValue = cache.get(id);
    if (!cache.has(id) || (cachedValue && cachedValue.expires < Date.now())) {
        const resp = await fetch(`${API_URL}/users/${id}`);
        const body = await resp.json() as BadgeCache["badges"];
        cache.set(id, { badges: body, expires: Date.now() + EXPIRES });
        return body;
    } else if (cachedValue) {
        return cachedValue.badges;
    }
};