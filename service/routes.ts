import { FastifyInstance, FastifyPluginOptions } from "fastify";
import controller from "./handler";
import { adminAuthValidationPreHandler } from "../utils/authValidation";

export default async function serviceRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  const handler = controller(fastify, opts);
  fastify.post("/create-service", { preHandler: [adminAuthValidationPreHandler] }, handler.createServiceHandler);
  fastify.put("/update-service", { preHandler: [adminAuthValidationPreHandler] }, handler.updateServiceHandler);
  fastify.post("/delete-service/:id", { preHandler: [adminAuthValidationPreHandler] }, handler.deleteServiceHandler);
  fastify.post("/list-service", { preHandler: [adminAuthValidationPreHandler] }, handler.listServiceHandler);
}
