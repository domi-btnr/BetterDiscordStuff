import Settings from "./settings.js";
import { timeRegexMatch, dateRegexMatch } from "../index.jsx";

export const getUnixTimestamp = (str, format) => {
    const timeMatch = str.match(timeRegexMatch);
    const dateMatch = str.match(dateRegexMatch);

    const formatParts = Settings.get("dateFormat", "dd.MM.yyyy").split(/[./]/);
    let dayIndex, monthIndex, yearIndex;
    formatParts.forEach((part, index) => {
        if (part.includes("dd")) dayIndex = index;
        if (part.includes("MM")) monthIndex = index;
        if (part.includes("yyyy")) yearIndex = index;
    });

    let date = new Date();
    if (dateMatch) {
        let day = parseInt(dateMatch[dayIndex + 1]);
        let month = parseInt(dateMatch[monthIndex + 1]);
        let year = parseInt(dateMatch[yearIndex + 1]);
        date = new Date(year, month - 1, day);
    }

    let time = date;
    if (timeMatch) {
        let [hours, minutes] = timeMatch[1].split(":").map(e => parseInt(e));
        if (timeMatch[2] && timeMatch[2].toLowerCase() === "pm" && hours < 12 && hours !== 0) {
            hours += 12;
            minutes = minutes.toString().padStart(2, "0");
        } else if ((timeMatch[2] && timeMatch[2].toLowerCase() === "am" && hours === 12) || (hours === 24)) {
            hours = 0;
        } else if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = (minutes % 60).toString().padStart(2, "0");
        }
        time = new Date(date);
        time.setHours(hours);
        time.setMinutes(minutes);
    }

    const then = Math.round(time.getTime() / 1000);
    if (isNaN(then)) return str;
    return `<t:${then}${format ? `:${format}` : ""}>`;
};