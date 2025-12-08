// Extracts "YYYY-MM-DD" and timezone offset ("+04:00", "-05:00", "Z")
function parseIsoDateAndOffset(iso: string) {
  const match = iso.match(
    /^(\d{4}-\d{2}-\d{2})T.*([+-]\d{2}:\d{2}|Z)$/
  );
  if (!match) throw new Error("Invalid ISO timestamp: " + iso);

  return {
    date: match[1],
    offset: match[2]
  };
}

/**
 * Build start/end of day ISO with the SAME timezone,
 * and also return UTC Date version.
 */
function buildBoundary(date: string, offset: string, type: "start" | "end") {
  const time =
    type === "start"
      ? "00:00:00.000"
      : "23:59:59.999";

  const iso = `${date}T${time}${offset}`;
  return {
    iso,
    utc: new Date(iso)
  };
}

/**
 * Convert any ISO timestamp → UTC Date
 */
export function toUtcDate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Get UTC boundaries (start & end) for *one* ISO timestamp
 */
export function getDayBoundariesFromIso(isoString: string) {
  const { date, offset } = parseIsoDateAndOffset(isoString);

  const start = buildBoundary(date, offset, "start");
  const end = buildBoundary(date, offset, "end");

  return {
    utcStart: start.utc,
    utcEnd: end.utc
  };
}

/**
 * Get UTC start boundary for fromIso
 * Get UTC end boundary for toIso
 */
export function getUtcRangeFromTwoIsoDates(fromIso: string, toIso: string) {
  const from = parseIsoDateAndOffset(fromIso);
  const to = parseIsoDateAndOffset(toIso);

  const start = buildBoundary(from.date, from.offset, "start");
  const end = buildBoundary(to.date, to.offset, "end");

  return {
    utcStart: start.utc,
    utcEnd: end.utc
  };
}
