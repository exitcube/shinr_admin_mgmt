import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { adminAuthValidationPreHandler } from "../utils/authValidation";
import controller from "./handler";

export default async function fileRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  const handler = controller(fastify, opts);
  fastify.post("/file", { preHandler: [adminAuthValidationPreHandler] }, handler.uploadFileHandler);
  fastify.get<{ Params: { id: string } }>(
    "/file/:id",
    { preHandler: [adminAuthValidationPreHandler] },
    handler.getFileByIdHandler
  );
  fastify.get<{ Params: { id: string } }>(
    "/file/:id/view",
    { preHandler: [adminAuthValidationPreHandler] },
    handler.viewFileHandler
  );
  fastify.get<{ Params: { id: string } }>(
    "/file/:id/download",
    { preHandler: [adminAuthValidationPreHandler] },
    handler.downloadFileHandler
  );
}
