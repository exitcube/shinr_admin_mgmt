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