import { Settings } from "@common/Settings";

import type { DateOrder, TimestampGroups, TimestampKind, TimestampStyle } from "../types";

interface Options {
    dateOrder: DateOrder;
    style: TimestampStyle;
    yearlessDates: boolean;
}

const TIME = String.raw`(?<![\w.:])(?<hours>\d{1,2})(?::(?<minutes>\d{2})(?!\d|:\d))?(?:[ \t]?(?<meridiem>[aApP][mM])\b(?!(?<=[ \t]am)[ \t]+[A-ZÄÖÜ]))?(?<=:\d\d|[mM])`;
const DATE = String.raw`(?<![\w.])(?<date>\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{2}[./-]\d{2}[./-]\d{2}|\d{2}\.\d{2}\.)(?!\w|[./]\d)`;

const STYLES: Record<TimestampStyle, Record<TimestampKind, string>> = {
    short: { time: "t", date: "d", dateTime: "s" },
    long: { time: "T", date: "D", dateTime: "F" },
    relative: { time: "R", date: "R", dateTime: "R" }
};

/** Seconds, minutes and hours are exact durations, while days, weeks, months and years follow the calendar */
const UNITS: [unit: { ms: number } | { field: "Date" | "Month" | "FullYear"; step: number }, names: string[]][] = [
    [{ ms: 1000 }, ["s", "sec", "secs", "second", "seconds"]],
    [{ ms: 60_000 }, ["m", "min", "mins", "minute", "minutes"]],
    [{ ms: 3_600_000 }, ["h", "hr", "hrs", "hour", "hours"]],
    [{ field: "Date", step: 1 }, ["d", "day", "days"]],
    [{ field: "Date", step: 7 }, ["w", "wk", "wks", "week", "weeks"]],
    [{ field: "Month", step: 1 }, ["mo", "mos", "month", "months"]],
    [{ field: "FullYear", step: 1 }, ["y", "yr", "yrs", "year", "years"]]
];
const UNITS_BY_NAME = new Map(UNITS.flatMap(([unit, names]) => names.map(name => [name, unit])));

const caseless = (word: string) => word.replace(/[a-z]/g, letter => `[${letter}${letter.toUpperCase()}]`);

const WORDS = [...UNITS_BY_NAME.keys()]
    .filter(name => name.length > 1)
    .sort((a, b) => b.length - a.length)
    .map(caseless)
    .join("|");
const DURATION_PART = String.raw`\d+(?:[ \t]*(?:${WORDS})|[smhdwy])\b`;
const DURATION_SEPARATOR = String.raw`(?:[ \t]*,[ \t]*|[ \t]+${caseless("and")}[ \t]+|[ \t]+)`;
const DURATION = String.raw`${DURATION_PART}(?:${DURATION_SEPARATOR}${DURATION_PART})*`;
const AGO = String.raw`[ \t]+${caseless("ago")}\b`;
const RELATIVE = String.raw`\b(?:${caseless("in")}[ \t]+(?<future>${DURATION})(?!${DURATION_SEPARATOR}${DURATION_PART}|${AGO})|(?<!${caseless("in")}[ \t]+(?:${DURATION_PART}${DURATION_SEPARATOR})*)(?<past>${DURATION})${AGO})`;

const SOURCES: [source: string, kind: TimestampKind][] = [
    [`${TIME}[ \\t]+${DATE}`, "dateTime"],
    [`${DATE}[ \\t]+${TIME}`, "dateTime"],
    [TIME, "time"],
    [DATE, "date"]
];
const PATTERNS = SOURCES.map(([source, kind]) => [new RegExp(source, "g"), kind] as const);
const RELATIVE_PATTERN = new RegExp(RELATIVE, "g");
const DURATION_PARTS = /(\d+)[ \t]*([a-z]+)/gi;

const ESCAPED = [...SOURCES.map(([source]) => source), RELATIVE]
    .map(source => source.replace(/\(\?<(?![=!])\w+>/g, "(?:"))
    .join("|");

const SKIPPED = new RegExp(
    String.raw`(\`\`\`[\s\S]*?\`\`\`|\`[^\`\n]*\`|\[[^\]\n]*\]\([^)\s]*\)|https?:\/\/\S+|<[^\s<>]+>|\\(?:${ESCAPED}))`
);

/** @returns The timestamp, or `match` itself if the date or time doesn't exist. */
function toTimestamp(match: string, groups: TimestampGroups, kind: TimestampKind, options: Options) {
    const date = new Date();

    if (groups.date) {
        const [first, second, third] = groups.date.split(/[./-]/).filter(Boolean);
        if (!third && !options.yearlessDates) return match;

        let [year, month, day] = [+first, +second, +third];
        if (first.length !== 4) {
            [day, month] = options.dateOrder === "month" ? [+second, +first] : [+first, +second];
            const currentYear = new Date().getFullYear();
            year = third ? +third : currentYear;
            if (third?.length === 2) year += year + 2000 > currentYear + 20 ? 1900 : 2000;
        }

        date.setFullYear(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return match;
    }

    if (groups.hours) {
        let hours = +groups.hours;
        const minutes = +(groups.minutes ?? 0);
        const meridiem = groups.meridiem?.toLowerCase();
        if (minutes > 59) return match;
        if (meridiem) {
            if (hours < 1 || hours > 12) return match;
            hours = (hours % 12) + (meridiem === "pm" ? 12 : 0);
        } else if (hours > 24 || (hours === 24 && minutes > 0)) return match;
        date.setHours(hours, minutes, 0, 0);
    }

    return `<t:${Math.round(date.getTime() / 1000)}:${STYLES[options.style][kind]}>`;
}

function toRelativeTimestamp(match: string, { future, past }: { future?: string; past?: string }) {
    const date = new Date();
    const sign = future ? 1 : -1;
    for (const [, value, name] of (future ?? past!).matchAll(DURATION_PARTS)) {
        const unit = UNITS_BY_NAME.get(name.toLowerCase())!;
        const amount = sign * +value;
        if ("ms" in unit) {
            date.setTime(date.getTime() + amount * unit.ms);
            continue;
        }

        const { field, step } = unit;
        if (field === "Date") {
            date.setDate(date.getDate() + amount * step);
            continue;
        }

        const day = date.getDate();
        date.setDate(1);
        date[`set${field}`](date[`get${field}`]() + amount * step);
        date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    }

    const seconds = Math.round(date.getTime() / 1000);
    return isNaN(seconds) ? match : `<t:${seconds}:R>`;
}

/** Turns plain times, dates and relative times like `in 5m` into Discord timestamps. */
export function replaceTimestamps(content: string) {
    const options: Options = {
        dateOrder: Settings.get("dateOrder", "day"),
        style: Settings.get("timestampStyle", "short"),
        yearlessDates: Settings.get("yearlessDates", true)
    };

    return content
        .split(SKIPPED)
        .map((part, index) => {
            if (index % 2) return part.startsWith("\\") ? part.slice(1) : part;
            return PATTERNS.reduce(
                (text, [pattern, kind]) =>
                    text.replace(pattern, (match, ...args) => toTimestamp(match, args.at(-1), kind, options)),
                part
            ).replace(RELATIVE_PATTERN, (match, ...args) => toRelativeTimestamp(match, args.at(-1)));
        })
        .join("");
}
