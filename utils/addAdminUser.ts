import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import bcrypt from "bcrypt";
import { AdminUser } from "../models/index";

type Result = {
  created: Array<{ row: number; userName: string; role: string }>;
  skipped: Array<{
    row: number;
    userName?: string;
    role?: string;
    reason: string;
  }>;
  errors: Array<{ row: number; error: string }>;
};

export async function addAdminUsers(
  csvFilePath: string,
  fastify: FastifyInstance,
  hashing = 10
): Promise<Result> {
  const result: Result = { created: [], skipped: [], errors: [] };

  const absolutePath = path.isAbsolute(csvFilePath)
    ? csvFilePath
    : path.resolve(process.cwd(), csvFilePath);

  let raw: string;
  try {
    raw = await fs.readFile(absolutePath, { encoding: "utf8" });
  } catch (err: any) {
    throw new Error(
      `Failed to read CSV file at ${absolutePath}: ${err.message || err}`
    );
  }

  let rows: any[];
  try {
    rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err: any) {
    throw new Error(`Failed to parse CSV file: ${err.message || err}`);
  }

  const adminRepo = fastify.db.getRepository(AdminUser);

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 2;
    try {
      const rawRow = rows[i];

      const userName = (rawRow.UserName ?? rawRow.username ?? "")
        .toString()
        .trim();
      const role = (rawRow.Role ?? rawRow.role ?? "").toString().trim();
      const password = (rawRow.Password ?? rawRow.password ?? "").toString();

      if (!role) {
        result.skipped.push({
          row: rowIndex,
          reason: "Missing Role",
          userName,
          role,
        });
        continue;
      }
      if (!password) {
        result.skipped.push({
          row: rowIndex,
          reason: "Missing Password",
          userName,
          role,
        });
        continue;
      }

      const existing = await adminRepo.findOne({ where: { role } });
      if (existing) {
        result.skipped.push({
          row: rowIndex,
          userName: existing.userName,
          role: existing.role,
          reason: "Role already exists",
        });
        continue;
      }

      const hashed = await bcrypt.hash(password, hashing);

      const newUser = adminRepo.create({
        userName,
        role,
        password: hashed,
      });

      await adminRepo.save(newUser);

      result.created.push({
        row: rowIndex,
        userName: newUser.userName,
        role: newUser.role,
      });
    } catch (err: any) {
      result.errors.push({ row: rowIndex, error: err.message ?? String(err) });
    }
  }

  return result;
}
