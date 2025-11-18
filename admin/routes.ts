import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { validation } from '../utils/validation';
import { adminLoginValidate} from './validators';
import controller from './handler';
 


export default async function adminLoginRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
	const handler = controller(fastify, opts);
    fastify.post('/login', {preHandler: [validation(adminLoginValidate)]}, handler.adminLoginHandler);
}