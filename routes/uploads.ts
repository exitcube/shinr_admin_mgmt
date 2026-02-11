import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import fs from "fs";
import { getLocalFilePath } from "../utils/fileStorage";

// Only allow our secure filenames: 48 hex chars + .ext (no path traversal)
const SAFE_FILENAME = /^[a-f0-9]{48}\.(jpg|jpeg|png|webp|gif|bin)$/i;

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bin: "application/octet-stream",
};

export default async function uploadsRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { filename: string } }>(
    "/uploads/:filename",
    async (request: FastifyRequest<{ Params: { filename: string } }>, reply: FastifyReply) => {
      const { filename } = request.params;
      if (!filename || !SAFE_FILENAME.test(filename)) {
        return reply.status(404).send({ message: "Not found" });
      }
      const storageLocation = path.join("uploads", filename);
      const filePath = getLocalFilePath(storageLocation);
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
      } catch {
        return reply.status(404).send({ message: "Not found" });
      }
      const ext = path.extname(filename).slice(1).toLowerCase();
      const mime = EXT_TO_MIME[ext] || "application/octet-stream";
      const stream = fs.createReadStream(filePath);
      return reply.type(mime).send(stream);
    }
  );
}
