import dotenv from "dotenv";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dotenv.config(); // Load .env
  const envFile = `.env/.env.${process.env.NODE_ENV || "development"}`;
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
  console.log(`Loaded env file: ${envFile}`);
} else {
  console.log("Running in production, using environment variables from process.env (e.g. PM2)");
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
