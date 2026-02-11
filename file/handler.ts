import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from "fastify";
import { File, AdminFile } from "../models";
import { createSuccessResponse } from "../utils/response";
import { APIError } from "../types/errors";
import { fileUpload, parseMultipart } from "../utils/fileUpload";
import { getFileStream } from "../utils/fileStorage";
import { ADMIN_FILE_CATEGORY } from "../utils/constant";

export default function fileController(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  return {
    /**
     * POST /admin/file
     * Admin uploads a file (multipart, field name: "file").
     * Returns file id and url for viewing or downloading.
     */
    uploadFileHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      const adminId = (request as any).user?.userId as string;
      const { body, files } = await parseMultipart(request);
      const fileField = files?.file;
      const singleFile = Array.isArray(fileField) ? fileField[0] : fileField;
      if (!singleFile) {
        throw new APIError(
          "No file provided. Use multipart field name 'file'.",
          400,
          "FILE_MISSING",
          false,
          "Upload a file using the 'file' field"
        );
      }
      const uploadResult = await fileUpload(singleFile, adminId);
      const fileRepo = fastify.db.getRepository(File);
      const adminFileRepo = fastify.db.getRepository(AdminFile);
      const newFile = fileRepo.create({
        fileName: uploadResult.fileName,
        storageLocation: uploadResult.storageLocation,
        mimeType: singleFile.mimetype,
        sizeBytes: singleFile.sizeBytes,
        provider: uploadResult.provider,
        url: uploadResult.url,
        isActive: true,
      });
      await fileRepo.save(newFile);
      const newAdminFile = adminFileRepo.create({
        adminId,
        fileId: newFile.id,
        category: ADMIN_FILE_CATEGORY.GENERAL,
        isActive: true,
      });
      await adminFileRepo.save(newAdminFile);
      reply.status(200).send(
        createSuccessResponse(
          {
            id: newFile.id,
            url: newFile.url,
            fileName: newFile.fileName,
            mimeType: newFile.mimeType,
            sizeBytes: Number(newFile.sizeBytes),
          },
          "File uploaded successfully"
        )
      );
    },

    /**
     * GET /admin/file/:id
     * Returns file info including url (use url to view in browser or in <img src="">).
     */
    getFileByIdHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> => {
      const id = parseInt(request.params.id, 10);
      if (Number.isNaN(id)) {
        throw new APIError("Invalid file id", 400, "INVALID_FILE_ID", false, "Invalid file id");
      }
      const fileRepo = fastify.db.getRepository(File);
      const file = await fileRepo.findOne({
        where: { id, isActive: true },
      });
      if (!file) {
        throw new APIError("File not found", 404, "FILE_NOT_FOUND", false, "File not found");
      }
      reply.status(200).send(
        createSuccessResponse({
          id: file.id,
          url: file.url,
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeBytes: Number(file.sizeBytes),
          provider: file.provider,
        })
      );
    },

    /**
     * GET /admin/file/:id/view
     * Streams the file with Content-Disposition: inline. Use this URL in <img src=""> or to open in browser.
     */
    viewFileHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> => {
      const id = parseInt(request.params.id, 10);
      if (Number.isNaN(id)) {
        throw new APIError("Invalid file id", 400, "INVALID_FILE_ID", false, "Invalid file id");
      }
      const fileRepo = fastify.db.getRepository(File);
      const file = await fileRepo.findOne({
        where: { id, isActive: true },
      });
      if (!file) {
        throw new APIError("File not found", 404, "FILE_NOT_FOUND", false, "File not found");
      }
      const { stream, mimeType } = await getFileStream(
        file.provider!,
        file.storageLocation,
        file.mimeType
      );
      reply
        .header("Content-Disposition", "inline")
        .type(mimeType)
        .send(stream);
    },

    /**
     * GET /admin/file/:id/download
     * Streams the file with Content-Disposition: attachment so browser downloads instead of displaying.
     */
    downloadFileHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> => {
      const id = parseInt(request.params.id, 10);
      if (Number.isNaN(id)) {
        throw new APIError("Invalid file id", 400, "INVALID_FILE_ID", false, "Invalid file id");
      }
      const fileRepo = fastify.db.getRepository(File);
      const file = await fileRepo.findOne({
        where: { id, isActive: true },
      });
      if (!file) {
        throw new APIError("File not found", 404, "FILE_NOT_FOUND", false, "File not found");
      }
      const { stream, mimeType } = await getFileStream(
        file.provider!,
        file.storageLocation,
        file.mimeType
      );
      const fileName = file.fileName || "download";
      reply
        .header("Content-Disposition", `attachment; filename="${fileName}"`)
        .type(mimeType)
        .send(stream);
    },
  };
}
