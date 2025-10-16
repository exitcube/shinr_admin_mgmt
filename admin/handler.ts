import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Car } from '../models/Cars';
import { CarSearchQuery } from './type';
import { createSuccessResponse } from '../utils/response';
import { BadRequestError, NotFoundError, APIError } from '../types/errors'; 

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  return {
    getCarsHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const query = request.query as CarSearchQuery;
        const { model, make, category, page = 1, limit = 10, sortBy = 'model', sortOrder = 'ASC' } = query;

        const carRepo = fastify.db.getRepository(Car);

        const qb = carRepo.createQueryBuilder('car')
          .leftJoinAndSelect('car.make', 'make')
          .leftJoinAndSelect('car.category', 'category')
          .where('car.isActive = :isActive', { isActive: true });


        if (model) qb.andWhere('car.model ILIKE :model', { model: `%${model}%` });
        if (make) qb.andWhere('make.name ILIKE :make', { make: `%${make}%` });
        if (category) qb.andWhere('category.name ILIKE :category', { category: `%${category}%` });


        if (sortBy === 'make') qb.orderBy('make.name', sortOrder);
        else if (sortBy === 'category') qb.orderBy('category.name', sortOrder);
        else qb.orderBy('car.model', sortOrder);

    
        const total = await qb.getCount();
        const cars = await qb.skip((page - 1) * limit).take(limit).getMany();

        if (!cars.length) {
          throw new NotFoundError('No cars found for the given search criteria', 'RECORD_NOT_FOUND');
        }

        const result = cars.map((c: Car) => ({
          id: c.id,
          model: c.model
        }));

        reply.status(200).send(createSuccessResponse(
          {
            data: result,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
          },
          'Cars fetched successfully'
        ));

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
}
}
