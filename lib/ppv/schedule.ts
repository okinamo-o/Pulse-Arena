import type { SportMatch } from "@/lib/ppv/types";

// Detect browser timezone
export function getUserTimeZone(): string {
  if (typeof window === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

// Convert a timestamp to local date string (YYYY-MM-DD)
export function toLocalDateString(timestamp: number, useUTC = false): string {
  if (!timestamp || timestamp <= 0) return "";
  const d = new Date(timestamp);
  const year = useUTC ? d.getUTCFullYear() : d.getFullYear();
  const month = String((useUTC ? d.getUTCMonth() : d.getMonth()) + 1).padStart(2, "0");
  const day = String(useUTC ? d.getUTCDate() : d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate an array of N consecutive dates starting from today
export interface DateInfo {
  dateString: string; // YYYY-MM-DD
  dayName: string; // e.g. Today, Tomorrow, Mon, Tue
  displayDate: string; // e.g. Jun 15
  timestamp: number;
}

export function getDaysRange(count = 10, baseTimestamp = Date.now(), useUTC = false): DateInfo[] {
  const range: DateInfo[] = [];
  const now = new Date(baseTimestamp);

  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    if (useUTC) {
      d.setUTCDate(now.getUTCDate() + i);
      d.setUTCHours(0, 0, 0, 0);
    } else {
      d.setDate(now.getDate() + i);
      d.setHours(0, 0, 0, 0);
    }

    const dateString = toLocalDateString(d.getTime(), useUTC);

    let dayName = "";
    if (i === 0) dayName = "Today";
    else if (i === 1) dayName = "Tomorrow";
    else {
      dayName = new Intl.DateTimeFormat("en", {
        weekday: "short",
        timeZone: useUTC ? "UTC" : undefined,
      }).format(d);
    }

    const displayDate = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      timeZone: useUTC ? "UTC" : undefined,
    }).format(d);

    range.push({
      dateString,
      dayName,
      displayDate,
      timestamp: d.getTime(),
    });
  }

  return range;
}

// Determine Schedule Density
export type DensityLevel = "Light Day" | "Medium Day" | "Busy Day";
export type DensityTone = "cyan" | "orange" | "lime";

export function getScheduleDensity(matchCount: number): { label: DensityLevel; tone: DensityTone } {
  if (matchCount <= 3) return { label: "Light Day", tone: "cyan" };
  if (matchCount <= 8) return { label: "Medium Day", tone: "orange" };
  return { label: "Busy Day", tone: "lime" };
}

// Time Blocks for Quick Jump
export type TimeBlock = "morning" | "afternoon" | "evening" | "night";

export function getTimeBlock(timestamp: number, useUTC = false): TimeBlock {
  const hours = useUTC ? new Date(timestamp).getUTCHours() : new Date(timestamp).getHours();
  if (hours >= 6 && hours < 12) return "morning";
  if (hours >= 12 && hours < 17) return "afternoon";
  if (hours >= 17 && hours < 21) return "evening";
  return "night";
}

export const TIME_BLOCKS: { id: TimeBlock; label: string; hoursRange: string }[] = [
  { id: "morning", label: "Morning", hoursRange: "06:00 - 12:00" },
  { id: "afternoon", label: "Afternoon", hoursRange: "12:00 - 17:00" },
  { id: "evening", label: "Evening", hoursRange: "17:00 - 21:00" },
  { id: "night", label: "Night", hoursRange: "21:00 - 06:00" },
];

// Calendar Exports
export function generateGoogleCalendarUrl(match: SportMatch): string {
  const startDate = new Date(match.date);
  const endDate = new Date(match.endsAt && match.endsAt > match.date ? match.endsAt : match.date + 2 * 60 * 60 * 1000);

  const formatDateStr = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const text = encodeURIComponent(`Pulse Arena: ${match.title}`);
  const dates = `${formatDateStr(startDate)}/${formatDateStr(endDate)}`;
  const details = encodeURIComponent(
    `Watch this event live on Pulse Arena!\nCategory: ${match.categoryName ?? match.category}\nMatch link: ${typeof window !== "undefined" ? window.location.origin : ""}/match/${match.id}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
}

export function generateOutlookUrl(match: SportMatch): string {
  const startDate = new Date(match.date);
  const endDate = new Date(match.endsAt && match.endsAt > match.date ? match.endsAt : match.date + 2 * 60 * 60 * 1000);

  const subject = encodeURIComponent(`Pulse Arena: ${match.title}`);
  const body = encodeURIComponent(
    `Watch this event live on Pulse Arena!\nCategory: ${match.categoryName ?? match.category}\nMatch link: ${typeof window !== "undefined" ? window.location.origin : ""}/match/${match.id}`
  );

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${body}`;
}

export function generateICSDownloadUrl(match: SportMatch): string {
  const startDate = new Date(match.date);
  const endDate = new Date(match.endsAt && match.endsAt > match.date ? match.endsAt : match.date + 2 * 60 * 60 * 1000);

  const formatDateStr = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const escapeICS = (str: string) =>
    (str || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "");

  const safeId = (match.id || "").replace(/[\r\n]/g, "");

  const fileContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pulse Arena//Sports Streaming//EN",
    "BEGIN:VEVENT",
    `UID:match-${safeId}@pulsearena`,
    `DTSTAMP:${formatDateStr(new Date())}`,
    `DTSTART:${formatDateStr(startDate)}`,
    `DTEND:${formatDateStr(endDate)}`,
    `SUMMARY:Pulse Arena: ${escapeICS(match.title)}`,
    `DESCRIPTION:Watch live on Pulse Arena. Category: ${escapeICS(match.categoryName ?? match.category)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(fileContent)}`;
}

// Normalize & group matches for schedule page
export interface HourGroup {
  hourString: string; // e.g. "18:00"
  timeBlock: TimeBlock;
  matches: SportMatch[];
}

export function groupMatchesByHour(matches: SportMatch[], useUTC = false): HourGroup[] {
  const groupsMap: Record<string, SportMatch[]> = {};

  matches.forEach((match) => {
    if (!match.date || match.date <= 0) return;
    const d = new Date(match.date);
    const hour = String(useUTC ? d.getUTCHours() : d.getHours()).padStart(2, "0");
    const minute = String(Math.floor((useUTC ? d.getUTCMinutes() : d.getMinutes()) / 15) * 15).padStart(2, "0");
    const hourString = `${hour}:${minute}`;

    if (!groupsMap[hourString]) {
      groupsMap[hourString] = [];
    }
    groupsMap[hourString].push(match);
  });

  return Object.keys(groupsMap)
    .sort()
    .map((hourString) => {
      const parts = hourString.split(":");
      const dummyDate = new Date();
      if (useUTC) {
        dummyDate.setUTCHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      } else {
        dummyDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      }

      const timeBlock = getTimeBlock(dummyDate.getTime(), useUTC);

      return {
        hourString,
        timeBlock,
        matches: groupsMap[hourString],
      };
    });
}

