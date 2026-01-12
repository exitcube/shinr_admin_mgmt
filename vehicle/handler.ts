import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Car, CarMake,CarCategory, } from '../models/index';
import { CarSearchQuery, CarBrandQuery } from './type';
import { createPaginatedResponse ,createSuccessResponse} from '../utils/response';
import { NotFoundError, APIError } from '../types/errors';
import { ILike } from 'typeorm';
import {  AddVehicleBrandBody ,UpdateVehicleBrandBody} from './type';
export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  return {
    getCarsModelHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const query = request.query as CarSearchQuery;
        const {
          search,
          makeId,
          categoryId,
          page = 1,
          limit = 10,
          sortOrder = 'asc',
        } = query;

        const carRepo = fastify.db.getRepository(Car);


        const where: any = { isActive: true };

        if (search) {
          where.model = ILike(`%${search}%`);
        }

        if (makeId) {
          where.makeId = makeId;
        }

        if (categoryId) {
          where.categoryId = categoryId;
        }

        const [cars, total] = await carRepo.findAndCount({
          where,
          relations: ['category', 'make'],
          order: { model: sortOrder},
          skip: (page - 1) * limit,
          take: limit,
        });
        const carsWithCategoryAndMake= cars.map((car: Car) => ({
          id: car.id,
          model: car.model,
          makeId: car.makeId,
          makeName: car.make.name ,
          categoryId:  car.categoryId,
          categoryName:car.category.name
        }));
        
        reply.status(200).send(
          createPaginatedResponse(
            carsWithCategoryAndMake,
            total,
            page,
            limit
          )
        );

      } catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to fetch cars',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'CAR_FETCH_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to fetch cars'
        );
      }
    },
    getCarsBrandHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const { page = 1, limit = 10 } = request.query as CarBrandQuery;
        const carMakeRepo = fastify.db.getRepository(CarMake);
        const [carBrands, total] = await carMakeRepo.findAndCount({
          select: ["id", "name"],
          order: { name: "ASC" },
          skip: (page - 1) * limit,
          take: limit,
        });
        console.log(carBrands);
        reply.status(200).send(createPaginatedResponse(carBrands, total, page, limit));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to fetch carBrands',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'CARBRANDS_FETCH_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to fetch carBrands'
        );
      }
    },
    addVehicleBrandHandler: async (request: FastifyRequest ,reply: FastifyReply): Promise<void> => {
      try {
        const { name } = request.body as AddVehicleBrandBody;
        const vehicleBrandRepo = fastify.db.getRepository(CarMake);
        const vehicleBrand = vehicleBrandRepo.create({ name });
        await vehicleBrandRepo.save(vehicleBrand);
        reply.status(200).send(createSuccessResponse(vehicleBrand, "Vehicle Brand added successfully"));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to add vehicleBrand',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'VEHICLE_BRAND_ADD_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to add vehicleBrand'
        );

      }
    },
    updateVehicleTypeHandler: async (request: FastifyRequest ,reply: FastifyReply): Promise<void> => {
      try {
        const { vehicleTypeId, name } = request.body as UpdateVehicleBrandBody;
        const vehicleBrandRepo = fastify.db.getRepository(CarMake);
        const result = await vehicleBrandRepo.update(
          { id: vehicleTypeId ,isActive:true},
          { name }
        );

        if (result.affected === 0) {
          throw new NotFoundError('Vehicle Type not found');
        }
        reply.status(200).send(createSuccessResponse(result, "Vehicle   Brand updated successfully"));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to update vehicleBrand',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'VEHICLE_BRAND_UPDATE_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to update vehicleBrand'
        );

      }
    },
      deleteVehicleBrandHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const  vehicleTypeId  = (request.params as any).id;
        const vehicleBrandRepo = fastify.db.getRepository(CarMake);
        const result = await vehicleBrandRepo.update({ id: vehicleTypeId }, { isActive: false });
         if (result.affected === 0) {
          throw new NotFoundError('Vehicle Type not found');
        }
        reply.status(200).send(createSuccessResponse(result, "Vehicle Brand deleted successfully"));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to delete vehicleBrand',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'VEHICLE_BRAND_DELETE_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to delete vehicleBrand'
        );
      }
    },
    vehicleBrandListingHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const { search, page = 1, limit = 10 } = request.query as any;

        const vehicleBrandRepo = fastify.db.getRepository(CarMake);

        const where: any = { isActive: true };
        if (search) {
          where.name = ILike(`%${search}%`);
        }

        const [vehicleBrands, total] = await vehicleBrandRepo.findAndCount(
          {
            where,
            order: { id: "ASC" },
            skip: (page - 1) * limit,
            take: limit,
          }
        );

        const vehicleBrandsList = vehicleBrands.map(
          (v: CarMake) => ({
            id: v.id,
            name: v.name,
          })
        );
        reply.status(200).send(createPaginatedResponse(vehicleBrandsList, total, page, limit));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to search VehicleBrand",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "VehicleBrand_Fetching_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to Fetch VehicleBrand"
        );
      }
    },

  }
}
