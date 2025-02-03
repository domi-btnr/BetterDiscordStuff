type CustomBadge = string | {
    name: string;
    badge: string;
    custom?: boolean;
};

export interface BadgeCache {
    badges: {
        [mod: string]: CustomBadge[];
    };
    expires: number;
}
