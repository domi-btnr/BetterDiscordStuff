import { createI18n } from "@common/i18n";

import de from "../locales/de.json";
import en from "../locales/en.json";

export const { i18n, t, useTranslation, Trans } = createI18n({
    resources: { en, de },
    discord: {
        "content.message": "sDqZHL",
        "content.image": "tCcq5p",
        "content.image_other": "rtfTKp",
        "content.video": "KxO2Yl",
        "content.video_other": "nYvQ07",
        "content.audio": "FWqQt5",
        "content.file": "mX8M6i",
        "content.file_other": "y0gZht",
        "content.attachment_other": "8/qgDd",
        "content.gif": "p0oZmy",
        "content.sticker": "dyquw8",
        "content.poll": "n3shVJ",
        "content.voiceMessage": "c8U6xd",
        "content.forwarded": "9ddYKt"
    }
});
