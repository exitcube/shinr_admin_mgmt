import { APIError } from "../types/errors";
import * as XLSX from "xlsx";

export function normalizePhone(input: string): string {
  return (input || "").replace(/\D/g, "");
}

export function getPhoneVariants(input: string): string[] {
  const raw = String(input || "").trim();
  if (!raw) {
    return [];
  }

  const normalized = normalizePhone(raw);
  const variants = new Set<string>();

  variants.add(raw);
  if (normalized) {
    variants.add(normalized);
    if (normalized.length > 10) {
      variants.add(normalized.slice(-10));
    }
    variants.add(`+${normalized}`);
  }

  return Array.from(variants);
}

export async function extractPhonesFromExcelBuffer(buffer: Buffer): Promise<string[]> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_INVALID",
      false,
      "Selected customer file is empty."
    );
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_INVALID",
      false,
      "Selected customer file has no rows."
    );
  }

  const firstRow = rows[0] || {};
  const keys = Object.keys(firstRow);
  const phoneKey =
    keys.find((k) => /phone|mobile/i.test(k)) ||
    keys.find((k) => /number/i.test(k)) ||
    keys[0];

  if (!phoneKey) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_INVALID",
      false,
      "Unable to find phone number column in selected customer file."
    );
  }

  const phones = rows
    .map((row) => String(row[phoneKey] ?? "").trim())
    .filter((value) => value.length > 0);

  return Array.from(new Set(phones));
}

export type ParsedLocation = {
  latitude: number;
  longitude: number;
};

function normalizeHeader(input: string): string {
  return (input || "").toLowerCase().replace(/[\s_-]/g, "");
}

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getValueByAliases(
  row: Record<string, unknown>,
  aliases: string[]
): unknown {
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeHeader(key);
    if (aliases.includes(normalizedKey)) {
      return value;
    }
  }
  return undefined;
}

export async function extractLocationsFromExcelBuffer(
  buffer: Buffer
): Promise<ParsedLocation[]> {

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new APIError(
      "Bad Request",
      400,
      "LOCATION_FILE_INVALID",
      false,
      "Location file is empty."
    );
  }

  const sheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    throw new APIError(
      "Bad Request",
      400,
      "LOCATION_FILE_INVALID",
      false,
      "Location file has no rows."
    );
  }

  const parsedLocations: ParsedLocation[] = [];

  rows.forEach((row, index) => {
    const excelRowNumber = index + 2;

    const latitudeValue = getValueByAliases(row, ["latitude", "lat"]);
    const longitudeValue = getValueByAliases(row, [
      "longitude",
      "long",
      "lon",
      "lng",
    ]);

    const latitude = parseCoordinate(latitudeValue);
    const longitude = parseCoordinate(longitudeValue);

    if (latitude === null || longitude === null) {
      throw new APIError(
        "Bad Request",
        400,
        "LOCATION_COORDINATE_INVALID",
        false,
        `Invalid latitude/longitude at row ${excelRowNumber}`
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new APIError(
        "Bad Request",
        400,
        "LOCATION_LATITUDE_OUT_OF_RANGE",
        false,
        `Latitude out of range at row ${excelRowNumber}`
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new APIError(
        "Bad Request",
        400,
        "LOCATION_LONGITUDE_OUT_OF_RANGE",
        false,
        `Longitude out of range at row ${excelRowNumber}`
      );
    }

    parsedLocations.push({
      latitude,
      longitude,
    });
  });

  return parsedLocations;
}