import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { authValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';
import { addServicesValidator } from './validators';

export default async function serviceRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.post('/add-service', { preHandler: [authValidationPreHandler, validation(addServicesValidator)] },handler.addServicesHandler);
  }