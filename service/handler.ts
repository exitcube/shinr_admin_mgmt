import {FastifyInstance,FastifyReply,FastifyRequest,FastifyPluginOptions,} from "fastify";
import { AdminFile, File, Service } from "../models";
import { createServiceBody, listServiceBody, updateServiceBody } from "./type";
import {createPaginatedResponse,createSuccessResponse,} from "../utils/response";
import { NotFoundError, APIError } from "../types/errors";
import { fileUpload, getDimension, parseMultipart } from "../utils/fileUpload";
import { ADMIN_FILE_CATEGORY,SERVICE_IMAGE_ALLOWED_MIMETYPE,SERVICE_IMAGE_DIMENSION,SERVICE_IMAGE_MAX_SIZE,ServiceStatus } from "../utils/constant";
import { createServiceValidateSchema,updateServiceValidateSchema} from "./validators";
import { ILike, In } from "typeorm";

export default function controller(fastify: FastifyInstance,opts: FastifyPluginOptions): any {
  return {
    createServiceHandler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      try {
        const adminId = (request as any).user?.userId;

        const { body, files } = await parseMultipart(request);

        const { error } = await createServiceValidateSchema.validate(body);
        if (error) {
          throw new Error(error.message);
        }

        const serviceImg = files?.serviceImage?.[0];

        if (!serviceImg) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_NOT_FOUND",
            false,
            "Service image is required",
          );
        }

        const { width, height } = await getDimension(serviceImg);

        if (
          width !== SERVICE_IMAGE_DIMENSION.WIDTH ||
          height !== SERVICE_IMAGE_DIMENSION.HEIGHT
        ) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_DIMENSION_INVALID",
            false,
            "Image must be exactly 193x239 pixels",
          );
        }

        if (!SERVICE_IMAGE_ALLOWED_MIMETYPE.includes(serviceImg.mimetype)) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_MIMETYPE_INVALID",
            false,
            "Image must be PNG or JPG",
          );
        }

        if (serviceImg.sizeBytes > SERVICE_IMAGE_MAX_SIZE) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_SIZEBYTE_INVALID",
            false,
            "Image must be less than 5MB",
          );
        }

        const { name, displayName, description, displaySequence } = body;

        const uploadResult = await fileUpload(serviceImg, adminId);

        const fileRepo = fastify.db.getRepository(File);
        const adminFileRepo = fastify.db.getRepository(AdminFile);
        const serviceRepo = fastify.db.getRepository(Service);

        const newFile = fileRepo.create({
          fileName: uploadResult.fileName,
          mimeType: serviceImg.mimetype,
          storageLocation: uploadResult.storageLocation,
          sizeBytes: serviceImg.sizeBytes,
          url: uploadResult.url,
          provider: uploadResult.provider,
          isActive: true,
        });

        await fileRepo.save(newFile);

        const newAdminFile = adminFileRepo.create({
          adminId: String(adminId),
          fileId: newFile.id,
          category: ADMIN_FILE_CATEGORY.SERVICE,
          isActive: true,
        });

        await adminFileRepo.save(newAdminFile);

        const newService = serviceRepo.create({
          name,
          displayName,
          description,
          displaySequence: displaySequence,
          status: ServiceStatus.ACTIVE.value,
          imageId: newAdminFile.id,
          createdBy: adminId,
          isActive: true,
        });

        await serviceRepo.save(newService);

        reply
          .status(200)
          .send(
            createSuccessResponse(newService, "Service created successfully"),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to add service",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "SERVICE_ADDING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to ADD service",
        );
      }
    },
    updateServiceHandler: async (
      request: FastifyRequest<{ Body: updateServiceBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const adminId = (request as any).user?.userId;

        const { body, files } = await parseMultipart(request);

        const { error } = await updateServiceValidateSchema.validate(body);
        if (error) throw new Error(error.message);

        const { serviceId, displayName, description, displaySequence, status } =
          body;

        const serviceImg = files?.serviceImage ? files.serviceImage[0] : null;

        const fileRepo = fastify.db.getRepository(File);
        const adminFileRepo = fastify.db.getRepository(AdminFile);
        const serviceRepo = fastify.db.getRepository(Service);

        const service = await serviceRepo.findOne({
          where: { id: serviceId, isActive: true },
        });

        if (!service) {
          throw new APIError(
            "Bad Request",
            400,
            "INVALID_SERVICE_ID",
            false,
            "Invalid service id",
          );
        }

        if (serviceImg) {
          const { width, height } = await getDimension(serviceImg);

          if (
            width !== SERVICE_IMAGE_DIMENSION.WIDTH ||
            height !== SERVICE_IMAGE_DIMENSION.HEIGHT
          ) {
            throw new APIError(
              "Bad Request",
              400,
              "IMAGE_DIMENSION_INVALID",
              false,
              "Image must be exactly 193 × 239 pixels.",
            );
          }

          if (!SERVICE_IMAGE_ALLOWED_MIMETYPE.includes(serviceImg.mimetype)) {
            throw new APIError(
              "Bad Request",
              400,
              "IMAGE_MIMETYPE_INVALID",
              false,
              "Image must be PNG OR JPG.",
            );
          }

          if (serviceImg.sizeBytes > SERVICE_IMAGE_MAX_SIZE) {
            throw new APIError(
              "Bad Request",
              400,
              "IMAGE_SIZEBYTE_INVALID",
              false,
              "Image must be less than 5MB",
            );
          }

          await fastify.db.query(
            `
        WITH updated_admin AS (
          UPDATE "adminFile"
          SET "isActive" = false
          WHERE id = $1
          AND "isActive" = true
          RETURNING "fileId"
        )
        UPDATE file
        SET "isActive" = false
        WHERE id = (SELECT "fileId" FROM updated_admin);
        `,
            [service.imageId],
          );

          const uploadResult = await fileUpload(serviceImg, adminId);

          const newFile = fileRepo.create({
            fileName: uploadResult.fileName,
            storageLocation: uploadResult.storageLocation,
            mimeType: serviceImg.mimetype,
            sizeBytes: serviceImg.sizeBytes,
            provider: uploadResult.provider,
            url: uploadResult.url,
            isActive: true,
          });

          await fileRepo.save(newFile);

          const newAdminFile = adminFileRepo.create({
            adminId,
            fileId: newFile.id,
            category: ADMIN_FILE_CATEGORY.SERVICE,
            isActive: true,
          });

          await adminFileRepo.save(newAdminFile);

          service.imageId = newAdminFile.id;
        }

        if (displayName) service.displayName = displayName;
        if (description) service.description = description;
        if (displaySequence) service.displaySequence = displaySequence;
        if (status) service.status = status;

        await serviceRepo.save(service);

        reply
          .status(200)
          .send(
            createSuccessResponse(
              { updated: true },
              "Service updated successfully",
            ),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to Update service",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "SERVICE_UPDATING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to Update service",
        );
      }
    },
    deleteServiceHandler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      try {
        const adminId = (request as any).user?.userId;
        const id = (request.params as any).id;
        const serviceRepo = fastify.db.getRepository(Service);

        const existingService = await serviceRepo.findOne({
          where: { id, isActive: true },
        });

        if (!existingService) {
          throw new APIError(
            "Bad Request",
            400,
            "INVALID_SERVICE_ID",
            false,
            "Invalid service id",
          );
        }

        existingService.isActive = false;
        existingService.removedBy = adminId;
        existingService.status = ServiceStatus.DRAFT.value;

        await serviceRepo.save(existingService);

        reply
          .status(200)
          .send(
            createSuccessResponse(
              { deleted: true },
              "Service deleted successfully",
            ),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to delete service",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "SERVICE_DELETING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to delete service",
        );
      }
    },
    listServiceHandler: async ( request: FastifyRequest, reply: FastifyReply,): Promise<void> => {
      try {
        const search = (request.query as any).search;

        const {
          status,
          page = 1,
          limit = 10,
          sortOrder = "ASC",
        } = (request.body as listServiceBody) || {};

        const serviceRepo = fastify.db.getRepository(Service);

        const baseFilter: any = { isActive: true };

        if (status && Array.isArray(status)) baseFilter.status = In(status);

        const where = search ? [{ ...baseFilter, displayName: ILike(`%${search}%`) }] : baseFilter;

        const services = await serviceRepo.find({
          where,
          order: { displaySequence: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          relations: ["adminFile", "adminFile.file"],
        });

        const total = await serviceRepo.count({ where });

        const listServices = services.map((service: any) => ({
          id: service.id,
          displayName: service.displayName,
          status: service.status,
          imageId: service.adminFile?.file?.url,
        }));

        reply
          .status(200)
          .send(createPaginatedResponse(listServices, total, page, limit));
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch services",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "SERVICE_LISTING_FAILED",
          true,
          "Failed to fetch services",
        );
      }
    },
  };
}
