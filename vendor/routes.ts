import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { authValidationPreHandler,adminAuthValidationPreHandler } from '../utils/authValidation';
 
 

export default async function vendorRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.get('/get-vendors',{ preHandler: [adminAuthValidationPreHandler] },handler.vendorListinghandler);
}