import dotenv from "dotenv";
import path from "path";

// PM2 detection
const isRunningUnderPM2 = !!process.env.PM2_HOME;

// Local development ONLY
if (!isRunningUnderPM2) {
  const env = process.env.NODE_ENV || "development";
  const envFile = path.resolve(process.cwd(), `.env/.env.${env}`);

  dotenv.config({ path: envFile });
  console.log(`Loaded local env file: ${envFile}`);
} else {
  console.log("Running under PM2, using ecosystem.config.js env variables");
}

// Ensure required JWT env vars are present
const requiredEnvVars = [
  "ACCESS_TOKEN_SECRET",
];

const missing = requiredEnvVars.filter((key) => !process.env[key] || process.env[key]?.trim() === "");
if (missing.length > 0) {
  const msg = `Missing required environment variables: ${missing.join(", ")}`;
  // Throwing ensures the app won't start with insecure defaults
  throw new Error(msg);
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DB_URL: process.env.DB_URL || "no-db-url-provided",
  // Optional: file storage (if not set, files are stored locally)
  FILE_BASE_URL: process.env.FILE_BASE_URL || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || "",
};
