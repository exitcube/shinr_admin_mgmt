import { FastifyRequest } from "fastify";
import { MultipartValue, MultipartFile } from "@fastify/multipart";
import { join } from "path";
import fs from "fs";
import { NormalizedFile, ParsedMultipart } from "../types";

export async function fileUpload(files:any,userId:any): Promise<any> {
   
      const uploadFolder = join(__dirname, "../uploads");
      await fs.promises.mkdir(uploadFolder, { recursive: true });
      const updatedName = `$USERID_${userId}_${Date.now()}.jpg`;
      const filePath = join(uploadFolder, updatedName);
      const buffer = await files.toBuffer();
      await fs.promises.writeFile(filePath, buffer);

  return filePath ;
}

//  use thi on every multiplart request to parse files and fields
export async function parseMultipart(req: FastifyRequest): Promise<ParsedMultipart> {
  const body: Record<string, string | undefined> = {};
  const files: Record<string, NormalizedFile[]> = {};

  const parts = req.parts();

  for await (const part of parts) {
    if ((part as MultipartFile).file) {
      const filePart = part as MultipartFile;
      const field = filePart.fieldname;

      if (!files[field]) files[field] = [];
      const buffer = await filePart.toBuffer();
      const sizeBytes = buffer.length; // file size

      files[field].push({
        filename: filePart.filename,
        mimetype: filePart.mimetype,
        sizeBytes,
        toBuffer: async () => buffer
      });

    } else {
      const fieldPart = part as MultipartValue<string>;
      body[fieldPart.fieldname] = fieldPart.value;
    }
  }

  return { body, files };
}
