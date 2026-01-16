import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Car, CarMake,CarCategory, } from '../models/index';
import { CarSearchQuery, CarBrandQuery } from './type';
import { createPaginatedResponse ,createSuccessResponse} from '../utils/response';
import { NotFoundError, APIError } from '../types/errors';
import { ILike ,SelectQueryBuilder } from 'typeorm';
import {  AddVehicleBrandBody ,UpdateVehicleBrandBody,AddVehicleBody,editVehicleBody} from './type';
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
        const existingVehicleBrand = await vehicleBrandRepo.findOne({ where: { name,isActive:true} });
        if (existingVehicleBrand) {
          throw new APIError(
            "Vehicle brand already exists",
            400,
            "VEHICLE_BRAND_EXISTS",
            false,
            "Vehicle brand already exists"
          );
        }
        const vehicleBrand = vehicleBrandRepo.create({ name ,isActive:true});
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
    updateVehicleBrandHandler: async (request: FastifyRequest ,reply: FastifyReply): Promise<void> => {
      try {
        const { vehicleTypeId, name } = request.body as UpdateVehicleBrandBody;
        const vehicleBrandRepo = fastify.db.getRepository(CarMake);
        const existingVehicleBrand = await vehicleBrandRepo.findOne({ where: { name ,isActive:true} });
        if (existingVehicleBrand) {
          throw new APIError(
            "Vehicle brand already exists",
            400,
            "VEHICLE_BRAND_EXISTS",
            false,
            "Vehicle brand already exists"
          );
        }
        const result = await vehicleBrandRepo.update(
          { id: vehicleTypeId ,isActive:true},
          { name }
        );

        if (result.affected === 0) {
         throw new APIError(
              "vehicle brand not found",
              400,
              "VEHICLE_BRAND_NOT_FOUND",
              false,
              "vehicle brand not found"
            );
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
         throw new APIError(
              "vehicle brand not found",
              400,
              "VEHICLE_BRAND_NOT_FOUND",
              false,
              "vehicle brand not found"
            );
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
     addVehicleHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {

        const { model ,makeId,categoryId}= request.body as AddVehicleBody;

        const vehicleRepo = fastify.db.getRepository(Car);
        const carCategoryRepo=fastify.db.getRepository(CarCategory);
        const carMakeRepo=fastify.db.getRepository(CarMake);

        const carCategory=await carCategoryRepo.findOne({where:{id:categoryId,isActive:true}});
        const carMake=await carMakeRepo.findOne({where:{id:makeId,isActive:true}});

        if(!carCategory || !carMake)
        {
          throw new APIError(
              "category or make not found",
              400,
              "CATEGORY_OR_MAKE_NOT_FOUND",
              false,
              "category or make not found"
            );
        }

        const existingVehicle=await vehicleRepo.findOne({where:{model,makeId,categoryId,isActive:true}});

        if(existingVehicle)
        {
          throw new APIError(
              "Vehicle already exists",
              400,
              "VEHICLE_EXISTS",
              false,
              "Vehicle already exists"
            );
        }

        const vehicle=vehicleRepo.create({model,makeId,categoryId,isActive:true});
        await vehicleRepo.save(vehicle);
        reply.status(200).send(createSuccessResponse(vehicle,"Vehicle added successfully"));
      }
      catch(error)
      {
        throw new APIError(
          (error as APIError).message || "Failed to add Vehicle",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Vehicle_Adding_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to add Vehicle"
        );

      }
    },
    editVehicleHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const vehicleId = (request.params as any).id;
        const { model, makeId, categoryId } = request.body as editVehicleBody;

        const vehicleRepo = fastify.db.getRepository(Car);
        const carCategoryRepo = fastify.db.getRepository(CarCategory);
        const carMakeRepo = fastify.db.getRepository(CarMake);

        const existingVehicle = await vehicleRepo.findOne({ where: { id: vehicleId, isActive: true } });

        if (!existingVehicle) {
          throw new APIError(
            "Vehicle not found",
            400,
            "VEHICLE_NOT_FOUND",
            false,
            "Vehicle not found"
          );
        }
        if (categoryId) {
          const carCategory = await carCategoryRepo.findOne({ where: { id: categoryId, isActive: true } });
          if (!carCategory) {
            throw new APIError(
              "Category not found",
              400,
              "CATEGORY_NOT_FOUND",
              false,
              "Category not found"
            );
          }
          existingVehicle.categoryId = categoryId;
        }
        if (makeId) {
          const carMake = await carMakeRepo.findOne({ where: { id: makeId, isActive: true } });
          if (!carMake) {
            throw new APIError(
              "Make not found",
              400,
              "MAKE_NOT_FOUND",
              false,
              "Make not found"
            );
          }
          existingVehicle.makeId = makeId;
        }
        if (model) existingVehicle.model = model;
        await vehicleRepo.save(existingVehicle);
        reply.status(200).send(createSuccessResponse(existingVehicle, "Vehicle updated successfully"));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to update Vehicle",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Vehicle_Update_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to update Vehicle"
        );

      }
    },
     deleteVehicleHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
       try {
         const vehicleId = (request.params as any).id;
         const vehicleRepo = fastify.db.getRepository(Car);
         const existingVehicle = await vehicleRepo.findOne({ where: { id: vehicleId, isActive: true } });
         if (!existingVehicle) {
           throw new APIError(
             "Vehicle not found",
             400,
             "VEHICLE_NOT_FOUND",
             false,
             "Vehicle not found"
           );
         }
         existingVehicle.isActive = false;
         await vehicleRepo.save(existingVehicle);
         reply.status(200).send(createSuccessResponse(existingVehicle, "Vehicle deleted successfully"));
       }
       catch (error) {
         throw new APIError(
           (error as APIError).message || "Failed to delete Vehicle",
           (error as APIError).statusCode || 500,
           (error as APIError).code || "Vehicle_Delete_FAILED",
           true,
           (error as APIError).publicMessage || "Failed to delete Vehicle"
         );
       }
    },
    vehicleModelsListingHandler:async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const { searchBrandId, searchVehicleTypeId, page = 1, limit = 10 } = request.query as any;

        const vehicleRepo = fastify.db.getRepository(Car);

        const where: any = { isActive: true };
        if (searchBrandId) {
          where.makeId = searchBrandId;
        }
        if (searchVehicleTypeId) {
          where.categoryId = searchVehicleTypeId;
        }

        const [vehicleModels, total] = await vehicleRepo.findAndCount(
          {
            where,
            order: { id: "ASC" },
            skip: (page - 1) * limit,
            take: limit,
            relations: ["make", "category"],
          }
        );

        const vehicleModelsList = vehicleModels.map(
          (v: Car) => ({
            id: v.id,
            model: v.model,
            make: v.make.name,
            category: v.category.name,
          })
        );
        reply.status(200).send(createPaginatedResponse(vehicleModelsList, total, page, limit));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to get Vehicle ",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Vehicle_Fetching_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to get Vehicle "
        );
      }
    },
    vehiclesBrandListingHandler:async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const { searchBrandId, page = 1, limit = 10 } = request.query as any;

        const repo = fastify.db.getRepository(CarMake);
        const totalBrands = await repo.count({
          where: { isActive: true },
        });

        const qb = repo
          .createQueryBuilder("make")
          .where("make.isActive = :active", { active: true })
          .loadRelationCountAndMap(
            "make.vehicleCount", 
            "make.cars",
            "car",
            (qb: SelectQueryBuilder<Car>) => qb.where("car.isActive = true")
          )
          .orderBy("make.id", "ASC")
          .skip((page - 1) * limit)
          .take(limit);

        if (searchBrandId) {
          qb.andWhere("make.id = :searchBrandId", { searchBrandId });
        }

        const [makes, total] = await qb.getManyAndCount();

        const response = makes.map((make: any) => ({
          id: make.id,
          name: make.name,
          numberOfVehicle: make.vehicleCount,
        }));

        reply.status(200).send(
          createPaginatedResponse([{ListedBrands:totalBrands}, response], total, page, limit)
        );
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to get VehiclesBrand",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "VehiclesBrand_Fetching_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to get VehiclesBrand"
        );
      }
    },

  }
}
