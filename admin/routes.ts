import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { validation } from '../utils/validation';
import { adminLoginValidate, createAdminUserValidate, editAdminUserValidate} from './validators';
import { adminAuthValidationPreHandler,superAdminRolePreHandler } from '../utils/authValidation';
import controller from './handler';
 


export default async function adminLoginRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
	const handler = controller(fastify, opts);
    fastify.post('/login', {preHandler: [validation(adminLoginValidate)]}, handler.adminLoginHandler);
     fastify.post('/createadminuser', {preHandler: [adminAuthValidationPreHandler,superAdminRolePreHandler, validation(createAdminUserValidate)]}, handler.createAdminUserHandler);
     fastify.get('/list-adminusers-roles', {preHandler: [adminAuthValidationPreHandler]},handler.adminRoleListingHandler);
     fastify.put('/edit-adminuser', {preHandler: [adminAuthValidationPreHandler,superAdminRolePreHandler, validation(editAdminUserValidate)]}, handler.editAdminUserHandler);
     fastify.post('/delete-adminuser', {preHandler: [adminAuthValidationPreHandler,superAdminRolePreHandler]}, handler.deleteAdminUserHandler);

}