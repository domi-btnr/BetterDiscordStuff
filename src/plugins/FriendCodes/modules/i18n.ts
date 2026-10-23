import { createI18n } from "@common/i18n";

import de from "../locales/de.json";
import en from "../locales/en.json";

export const { i18n, t, useTranslation, Trans } = createI18n({
    resources: { en, de },
    discord: {
        "card.copy": "OpuAlK",
        "card.copied": "q30c5i",
        "panel.retry": "TdQXA8"
    }
});
