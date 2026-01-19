import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { adminAuthValidationPreHandler, authValidationPreHandler} from '../utils/authValidation';
import { validation } from '../utils/validation';
import { carSearchValidate,addVehicleBrandValidate,updateVehicleBrandValidate,addVehicleValidate,editVehicleValidate,vehicleModelsListingValidate,addVehicleTypeValidate,updateVehicleTypeValidate } from './validators';

export default async function vehicleRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const handler = controller(fastify, opts);
  fastify.get('/car-listing', { preHandler: [authValidationPreHandler, validation(carSearchValidate)] }, handler.getCarsModelHandler);
  fastify.get('/car-brands',{ preHandler: [authValidationPreHandler]}, handler.getCarsBrandHandler);
fastify.post('/add-brand',{preHandler:[adminAuthValidationPreHandler,validation(addVehicleBrandValidate)]}, handler.addVehicleBrandHandler);
fastify.put('/update-brand', {preHandler:[adminAuthValidationPreHandler,validation(updateVehicleBrandValidate)]}, handler.updateVehicleBrandHandler);
fastify.delete('/delete-brand/:id', {preHandler:[adminAuthValidationPreHandler]}, handler.deleteVehicleBrandHandler);
fastify.get('/brand-listing/:search', {preHandler:[adminAuthValidationPreHandler]}, handler.vehicleBrandListingHandler);
fastify.post('/add-vehicle',{preHandler:[adminAuthValidationPreHandler,validation(addVehicleValidate)]}, handler.addVehicleHandler);
fastify.put('/edit-vehicle/:id', {preHandler:[adminAuthValidationPreHandler,validation(editVehicleValidate)]}, handler.editVehicleHandler);
fastify.post('/delete-vehicle/:id', {preHandler:[adminAuthValidationPreHandler]}, handler.deleteVehicleHandler);
fastify.post('/vehicle-models-listing', {preHandler:[adminAuthValidationPreHandler, validation(vehicleModelsListingValidate)]}, handler.vehicleModelsListingHandler);
fastify.get('/vehicle-brand-listing', {preHandler:[adminAuthValidationPreHandler]}, handler.vehiclesBrandListingHandler);
fastify.get('/list-vehicle-types',{ preHandler: [adminAuthValidationPreHandler]}, handler.vehicleTypeListingHandler);
fastify.post('/add-vehicle-types',{ preHandler: [adminAuthValidationPreHandler, validation(addVehicleTypeValidate)]}, handler.addVehicleTypeHandler);
fastify.put('/update-vehicle-types', { preHandler: [adminAuthValidationPreHandler, validation(updateVehicleTypeValidate)] }, handler.updateVehicleTypeHandler);
fastify.post('/delete-vehicle-types/:id', { preHandler: [adminAuthValidationPreHandler] }, handler.deleteVehicleTypeHandler);
fastify.get('/vehicle-type-listing', {preHandler:[adminAuthValidationPreHandler]}, handler.getVehicleTypeListHandler);
}