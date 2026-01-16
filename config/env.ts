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
  DB_URL: process.env.DB_URL || "no-db-url-provided"
};
