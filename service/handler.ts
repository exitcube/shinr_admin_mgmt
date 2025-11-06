import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Service } from '../models/index';
import { addServicesBody } from './type';
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
        }
    }
}