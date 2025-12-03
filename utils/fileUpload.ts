import { FastifyRequest } from "fastify";
import { MultipartValue, MultipartFile } from "@fastify/multipart";
import { join } from "path";
import fs from "fs";
import { NormalizedFile, ParsedMultipart } from "../types";
import sharp from "sharp";

export async function getDimension(files:NormalizedFile): Promise<any> {
  const buffer = await files.toBuffer();
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height
  };

}

export async function fileUpload(files:any,userId:any): Promise<any> {
   
      const uploadFolder = join(__dirname, "../uploads");
      await fs.promises.mkdir(uploadFolder, { recursive: true });
      const updatedName = `$USERID_${userId}_${Date.now()}.jpg`;
      const filePath = join(uploadFolder, updatedName);
      const buffer = await files.toBuffer();
      const metadata = await sharp(buffer).metadata();
      await fs.promises.writeFile(filePath, buffer);

  return filePath ;
}

//  use thi on every multiplart request to parse files and fields
export async function parseMultipart(req: FastifyRequest): Promise<ParsedMultipart> {
  const body: Record<string, any> = {};
  const files: Record<string, NormalizedFile[]> = {};

  const parts = req.parts();

  for await (const part of parts) {

    // ----------------------------
    // FILE HANDLING
    // ----------------------------
    if ((part as MultipartFile).file) {
      const filePart = part as MultipartFile;
      let field = filePart.fieldname;

      // normalize: gallery[] → gallery
      if (field.endsWith("[]")) field = field.replace("[]", "");

      if (!files[field]) files[field] = [];

      const buffer = await filePart.toBuffer();
      const sizeBytes = buffer.length;

      files[field].push({
        filename: filePart.filename,
        mimetype: filePart.mimetype,
        sizeBytes,
        toBuffer: async () => buffer
      });

      continue;
    }

    // ----------------------------
    // FIELD HANDLING
    // ----------------------------
    const fieldPart = part as MultipartValue<string>;
    const name = fieldPart.fieldname;
    const value = fieldPart.value;

    // Case 1 — tags[] => array
    if (name.endsWith("[]")) {
      const clean = name.replace("[]", "");
      if (!Array.isArray(body[clean])) body[clean] = [];
      body[clean].push(value);
      continue;
    }

    // Case 2 — repeated fields => array
    if (body[name]) {
      if (!Array.isArray(body[name])) body[name] = [body[name]];
      body[name].push(value);
      continue;
    }

    // Case 3 — single field
    body[name] = value;
  }

  return { body, files };
}