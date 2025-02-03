import { Components } from "@api";
import React from "react";

import { API_URL, fetchBadges } from "../modules/fetchBadges";
import Settings from "../modules/settings";
import { BadgeCache } from "../types/index";

export default function GlobalBadges(props: { userId: string }) {
    const { userId } = props;
    const [badges, setBadges] = React.useState<BadgeCache["badges"]>({});
    React.useEffect(() => {
        fetchBadges(userId)
            .then(setBadges);
    }, []);

    if (!badges || !Object.keys(badges).length) return null;
    const globalBadges: JSX.Element[] = [];

    Object.keys(badges).forEach(mod => {
        badges[mod].forEach(badge => {
            if (typeof badge === "string") {
                const fullNames = { "hunter": "Bug Hunter", "early": "Early User" };
                badge = {
                    name: fullNames[badge] ? fullNames[badge] : badge,
                    badge: `${API_URL}/badges/${mod}/${badge.toLowerCase()}`
                };
            } else if (typeof badge === "object") badge.custom = true;
            if (!Settings.get("showCustomBadges", true) && badge.custom) return;
            const cleanName = badge.name.replace(mod, "").trim();
            const prefix = Settings.get("showPrefix", true) ? mod : "";
            if (!badge.custom) badge.name = `${prefix} ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
            globalBadges.push(
                <Components.Tooltip text={badge.name}>
                    {props => (
                        <img
                            {...props}
                            src={badge.badge}
                            style={{
                                width: "20px",
                                height: "20px",
                                margin: "0 -1px",
                                transform: badge.badge.includes("Replugged") ? "scale(0.85)" : "scale(0.9)"
                            }}
                        />

                    )}
                </Components.Tooltip>
            );
        });
    });

    return (
        <React.Fragment>
            {globalBadges}
        </React.Fragment>
    );
}
