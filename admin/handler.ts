import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Car } from '../models/Cars';
import { CarSearchQuery } from './type';
import { createPaginatedResponse } from '../utils/response';
import { NotFoundError, APIError } from '../types/errors';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  return {
    getCarsHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const query = request.query as CarSearchQuery;
        const {
          searchByModel,
          make,
          category,
          page = 1,
          limit = 10,
          sortBy = 'model',
          sortOrder = 'ASC',
        } = query;

        const carRepo = fastify.db.getRepository(Car);

        
        let cars: Car[] = await carRepo.find({
          where: { isActive: true },
          relations: ['make', 'category'],
        });

     
        if (searchByModel) {
          cars = cars.filter((c: Car) => c.model.toLowerCase().includes(searchByModel.toLowerCase()));
        }
        if (make) {
          cars = cars.filter((c: Car) => c.make?.name.toLowerCase().includes(make.toLowerCase()));
        }
        if (category) {
          cars = cars.filter((c: Car) => c.category?.name.toLowerCase().includes(category.toLowerCase()));
        }

        const total = cars.length;

        if (!total) {
          throw new NotFoundError('No cars found for the given search criteria', 'RECORD_NOT_FOUND');
        }

        
        const sortedCars = cars.sort((a: Car, b: Car) => {
          const orderFactor = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;
          if (sortBy === 'make') return (a.make?.id! - b.make?.id!) * orderFactor;
          if (sortBy === 'category') return (a.category?.id! - b.category?.id!) * orderFactor;
          return a.model.localeCompare(b.model) * orderFactor;
        });

       
        const result = sortedCars.slice((page - 1) * limit, page * limit);

      
        reply.status(200).send(
          createPaginatedResponse(
            result.map((c: Car) => ({
              id: c.id,
              model: c.model,
            })),
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
    }
  };
}
