import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { authValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';
import { carSearchValidate } from './validators';

export default async function vehicleRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const handler = controller(fastify, opts);
  fastify.get('/', { preHandler: [authValidationPreHandler, validation(carSearchValidate)] }, handler.getCarsModelHandler);
  fastify.get('/car-brands',{ preHandler: [authValidationPreHandler]}, handler.getCarsBrandHandler);
}