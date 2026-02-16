import * as XLSX from "xlsx";
import { In, Repository } from "typeorm";
import { APIError } from "../types/errors";
import {
  AdminFile,
  File,
  RewardUserTarget,
  RewardUserTargetConfig,
  RewardsByLocation,
  User,
} from "../models";
import { fileUpload } from "../utils/fileUpload";
import {ADMIN_FILE_CATEGORY,allowedManualMimeTypes,TargetAudience} from "../utils/constant";
import { ParsedLocation, ProcessManualLocationConfigParams, ProcessManualSelectedUserConfigParams, SaveFileAndAdminFileParams } from "./type";


export async function saveFileAndAdminFile(
  fileRepo: Repository<File>,
  adminFileRepo: Repository<AdminFile>,
  params: SaveFileAndAdminFileParams
): Promise<{ file: File; adminFile: AdminFile }> {
  const { adminId, category, uploadResult, mimeType, sizeBytes } = params;

  const file = fileRepo.create({
    fileName: uploadResult.fileName,
    storageLocation: uploadResult.storageLocation,
    mimeType,
    sizeBytes,
    provider: uploadResult.provider,
    url: uploadResult.url,
    isActive: true,
  });
  await fileRepo.save(file);

  const adminFile = adminFileRepo.create({
    adminId: String(adminId),
    fileId: file.id,
    category,
    isActive: true,
  });
  await adminFileRepo.save(adminFile);

  return { file, adminFile };
}

function findManualTargetAudienceConfig(targetAudiences: RewardUserTargetConfig[], targetValue: string): RewardUserTargetConfig | undefined {
  return targetAudiences.find(
    (item: RewardUserTargetConfig) =>
      item.category === TargetAudience.MANUAL.value &&
      item.isFile &&
      item.value === targetValue
  );
}

export function getManualSelectedUserConfig(targetAudiences: RewardUserTargetConfig[]): RewardUserTargetConfig | undefined {
 return findManualTargetAudienceConfig(targetAudiences, "SELECTED_CUSTOMER");
}

export function getManualLocationConfig(targetAudiences: RewardUserTargetConfig[]): RewardUserTargetConfig | undefined {
  return findManualTargetAudienceConfig(targetAudiences, "LOCATION_BASED");
}



export async function processManualSelectedUserConfig(
  params: ProcessManualSelectedUserConfigParams
): Promise<void> {
  const {
    manualFile,
    adminId,
    rewardId,
    fileRepo,
    adminFileRepo,
    userRepo,
    rewardUserTargetRepo,
  } = params;

  if (!manualFile) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_REQUIRED",
      false,
      "selectedCustomer file is required for manual target audience."
    );
  }

  if (!allowedManualMimeTypes.includes(manualFile.mimetype)) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_INVALID_MIMETYPE",
      false,
      "Selected customer file must be an Excel file."
    );
  }

  const manualUploadResult = await fileUpload(manualFile, String(adminId));
  await saveFileAndAdminFile(fileRepo, adminFileRepo, {
    adminId,
    category: ADMIN_FILE_CATEGORY.BANNER_AUDIENCE,
    uploadResult: manualUploadResult,
    mimeType: manualFile.mimetype,
    sizeBytes: manualFile.sizeBytes,
  });

  const manualFileBuffer = await manualFile.toBuffer();
  const phones = await extractPhonesFromExcelBuffer(manualFileBuffer);

  if (!phones.length) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_INVALID",
      false,
      "Selected customer file has no phone numbers."
    );
  }

  const allPhoneVariants = Array.from(
    new Set(phones.flatMap((phone) => getPhoneVariants(phone)))
  );

  if (!allPhoneVariants.length) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_FILE_INVALID",
      false,
      "Selected customer file has no valid phone numbers."
    );
  }

  const users = await userRepo.find({
    where: { mobile: In(allPhoneVariants), isActive: true },
    select: ["id"],
  });

  const userIdSet = new Set<number>(users.map((user: User) => user.id));

  if (!userIdSet.size) {
    throw new APIError(
      "Bad Request",
      400,
      "MANUAL_USERS_NOT_FOUND",
      false,
      "No active users found for the phone numbers in selected customer file."
    );
  }

  const rewardUserTargets = Array.from(userIdSet).map((userId) =>
    rewardUserTargetRepo.create({
      rewardId,
      userId,
      isActive: true,
    })
  );

  await rewardUserTargetRepo.save(rewardUserTargets);
}



export async function processManualLocationConfig(
  params: ProcessManualLocationConfigParams
): Promise<void> {
  const {
    locationFile,
    adminId,
    rewardId,
    fileRepo,
    adminFileRepo,
    rewardsByLocationRepo,
  } = params;

  if (!locationFile) {
    throw new APIError(
      "Bad Request",
      400,
      "LOCATION_FILE_REQUIRED",
      false,
      "Location file is required for location-based manual targeting."
    );
  }

  if (!allowedManualMimeTypes.includes(locationFile.mimetype)) {
    throw new APIError(
      "Bad Request",
      400,
      "LOCATION_FILE_INVALID_MIMETYPE",
      false,
      "Location file must be an Excel file."
    );
  }

  const locationUploadResult = await fileUpload(locationFile, String(adminId));
  await saveFileAndAdminFile(fileRepo, adminFileRepo, {
    adminId,
    category: ADMIN_FILE_CATEGORY.BANNER_AUDIENCE,
    uploadResult: locationUploadResult,
    mimeType: locationFile.mimetype,
    sizeBytes: locationFile.sizeBytes,
  });

  const locationBuffer = await locationFile.toBuffer();
  const parsedLocations = await extractLocationsFromExcelBuffer(locationBuffer);

  if (!parsedLocations.length) {
    throw new APIError(
      "Bad Request",
      400,
      "LOCATION_FILE_INVALID",
      false,
      "Location file has no valid coordinates."
    );
  }

  const locationEntities = parsedLocations.map((loc) =>
    rewardsByLocationRepo.create({
      rewardId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      isActive: true,
    })
  );

  await rewardsByLocationRepo.save(locationEntities);
}

function normalizePhone(input: string): string {
  return (input || "").replace(/\D/g, "");
}

function getPhoneVariants(input: string): string[] {
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

async function extractPhonesFromExcelBuffer(buffer: Buffer): Promise<string[]> {
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

async function extractLocationsFromExcelBuffer(
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
