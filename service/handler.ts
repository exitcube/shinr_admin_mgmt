import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Service } from '../models/index';
import { addServicesBody,updateServicesBody } from './type';
import { createPaginatedResponse ,createSuccessResponse} from '../utils/response';
import { NotFoundError, APIError } from '../types/errors';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions):any {
  return {
        addServicesHandler: async (request: FastifyRequest<{ Body: addServicesBody }>,reply: FastifyReply) => {
            try {
                const { name, displayName,imageId, targetValue } = request.body;
                const serviceRepo = fastify.db.getRepository(Service);
                const service = serviceRepo.create({ name:name,displayName:displayName,imageId:imageId, targetValue:targetValue,isActive:true });
                await serviceRepo.save(service);
                return reply.status(201).send(createSuccessResponse(service, 'Service added successfully'));
            }
            catch (error) {
                throw new APIError(
                    (error as APIError).message || 'Failed to add service',
                    (error as APIError).statusCode || 500,
                    (error as APIError).code || 'SERVICE_ADDING_FAILED',
                    true,
                    (error as APIError).publicMessage || 'Failed to ADD service'
                );
            }

        },
        updateServicesHandler: async (request: FastifyRequest<{ Body: updateServicesBody }>,reply: FastifyReply) => {
            try {
              const { name, displayName, imageId, targetValue } = request.body;
              const { id } = request.params as any;
              const serviceId = Number(id);
              const serviceRepo = fastify.db.getRepository(Service);
              const service = await serviceRepo.findOne({
                where: { id: serviceId },
              });
              if (!service) {
                throw new APIError(
                  "Invalid service id",
                  400,
                  "INVALID_Service_ID",
                  true,
                  "Please provide a valid Service id"
                );
              }

              await serviceRepo.update(serviceId, {
                name: name ?? service.name,
                displayName: displayName ?? service.displayName,
                imageId: imageId ?? service.imageId,
                targetValue: targetValue ?? service.targetValue,
              });
              const response = createSuccessResponse(
                { updated: 1, serviceId },
                "Service Updated successfully"
              );
              return reply.status(200).send(response);
            } catch (error) {
              throw new APIError(
                (error as APIError).message || "Failed to Update service",
                (error as APIError).statusCode || 500,
                (error as APIError).code || "SERVICE_UPDATING_FAILED",
                true,
                (error as APIError).publicMessage || "Failed to Update service"
              );
            }

        }

    }
}