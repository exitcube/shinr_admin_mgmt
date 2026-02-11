import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NormalizedFile } from "../types";
import { FILE_PROVIDER } from "./constant";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const UPLOADS_DIR = "uploads";
const SECURE_NAME_BYTES = 24; // 48 hex chars – unguessable

export interface StoreFileResult {
  storageLocation: string;
  url: string;
  provider: string;
  fileName: string; // original client filename (for DB fileName column)
}

/**
 * Generates a cryptographically random filename so that having one link
 * does not allow guessing other file paths (no enumeration).
 */
function generateSecureFileName(mimetype: string): string {
  const ext = MIME_TO_EXT[mimetype] || "bin";
  const random = crypto.randomBytes(SECURE_NAME_BYTES).toString("hex");
  return `${random}.${ext}`;
}

function isS3Configured(): boolean {
  return !!(
    process.env.AWS_S3_BUCKET?.trim() &&
    process.env.AWS_REGION?.trim() &&
    process.env.AWS_ACCESS_KEY_ID?.trim() &&
    process.env.AWS_SECRET_ACCESS_KEY?.trim()
  );
}

function getBaseUrl(): string {
  const base = process.env.FILE_BASE_URL?.trim();
  if (base) return base.replace(/\/$/, "");
  return "";
}

async function storeLocal(
  file: NormalizedFile,
  secureName: string
): Promise<{ storageLocation: string; url: string }> {
  const uploadsDir = path.join(process.cwd(), UPLOADS_DIR);
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const fullPath = path.join(uploadsDir, secureName);
  const buffer = await file.toBuffer();
  await fs.promises.writeFile(fullPath, buffer);
  const storageLocation = `${UPLOADS_DIR}/${secureName}`;
  const baseUrl = getBaseUrl();
  const url = baseUrl ? `${baseUrl}/uploads/${secureName}` : `/uploads/${secureName}`;
  return { storageLocation, url };
}

async function storeS3(
  file: NormalizedFile,
  secureName: string
): Promise<{ storageLocation: string; url: string }> {
  let S3Client: typeof import("@aws-sdk/client-s3").S3Client;
  let PutObjectCommand: typeof import("@aws-sdk/client-s3").PutObjectCommand;
  try {
    const s3 = await import("@aws-sdk/client-s3");
    S3Client = s3.S3Client;
    PutObjectCommand = s3.PutObjectCommand;
  } catch {
    throw new Error(
      "S3 is configured but @aws-sdk/client-s3 is not installed. Run: npm install @aws-sdk/client-s3"
    );
  }
  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION!;
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const buffer = await file.toBuffer();
  const key = `${UPLOADS_DIR}/${secureName}`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    })
  );
  const storageLocation = key;
  const cdnBase = process.env.S3_PUBLIC_BASE_URL?.trim();
  const url = cdnBase
    ? `${cdnBase.replace(/\/$/, "")}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return { storageLocation, url };
}

/**
 * Stores a file either in S3 (if configured) or locally.
 * Filename is always hashed so links are unguessable and do not allow enumeration.
 */
export async function storeFile(
  file: NormalizedFile,
  _userId?: string
): Promise<StoreFileResult> {
  const secureName = generateSecureFileName(file.mimetype);
  let storageLocation: string;
  let url: string;
  let provider: string;

  if (isS3Configured()) {
    const result = await storeS3(file, secureName);
    storageLocation = result.storageLocation;
    url = result.url;
    provider = FILE_PROVIDER.S3;
  } else {
    const result = await storeLocal(file, secureName);
    storageLocation = result.storageLocation;
    url = result.url;
    provider = FILE_PROVIDER.LOCAL;
  }

  return {
    storageLocation,
    url,
    provider,
    fileName: file.filename,
  };
}

/**
 * Resolves the absolute filesystem path for a local file (for serving or delete).
 * Only use when provider is LOCAL; storageLocation is relative e.g. "uploads/abc.jpg".
 */
export function getLocalFilePath(storageLocation: string): string {
  if (path.isAbsolute(storageLocation)) return storageLocation;
  return path.join(process.cwd(), storageLocation);
}
