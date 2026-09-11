import { Data, UI, Webpack } from "@api";
import { Manifest } from "@manifest";

interface I18n {
    getLocale: () => string;
}

export default function showChangelog(manifest: Manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog?.changes?.length) return;

    const i18n: I18n = Webpack.getByKeys("getLocale")!;
    const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    const { date, title, subtitle, ...changelog } = manifest.changelog;

    UI.showChangelogModal({
        title: title ?? `What's New - ${manifest.name}`,
        subtitle: subtitle ?? `${date ? formatter.format(new Date(date)) + " - " : ""}v${manifest.version}`,
        ...changelog
    });

    Data.save("lastVersion", manifest.version);
}
