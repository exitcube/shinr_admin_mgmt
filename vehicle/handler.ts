import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Car, CarMake} from '../models/index';
import { CarSearchQuery,CarBrandQuery } from './type';
import { createPaginatedResponse } from '../utils/response';
import { NotFoundError, APIError } from '../types/errors';
import { ILike } from 'typeorm';

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
          where.makeId =  makeId ;
        }

        if (categoryId) {
          where.categoryId = categoryId ;
        }

        const [cars, total] = await carRepo.findAndCount({
          where,
          select:['id','model'],
          order: { model: sortOrder},
          skip: (page - 1) * limit,
          take: limit,
        });
        
        reply.status(200).send(
          createPaginatedResponse(
            cars,
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
        const [carBrands,total]= await carMakeRepo.findAndCount({
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
    }
  }
}
