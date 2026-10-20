import { Data, UI } from "@api";
import { Manifest } from "@manifest";
import React from "react";

import { getLocale } from "../i18n";
import Footer from "./footer";

export default function showChangelog(manifest: Manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog) return;

    const { date, title, subtitle, ...changelog } = manifest.changelog;
    if (!changelog.changes?.length && !changelog.blurb && !changelog.video && !changelog.banner) return;

    const formatter = new Intl.DateTimeFormat(getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog,
        footer: <Footer manifest={manifest} />
    });
    Data.save("lastVersion", manifest.version);
}
