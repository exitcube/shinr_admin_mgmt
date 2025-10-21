import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Car } from '../models/Cars';
import { CarSearchQuery } from './type';
import { createPaginatedResponse } from '../utils/response';
import { NotFoundError, APIError } from '../types/errors';
import { ILike } from 'typeorm';

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
          makeId,
          category,
          categoryId,
          page = 1,
          limit = 10,
          sortOrder = 'asc',
        } = query;

        const carRepo = fastify.db.getRepository(Car);


        const where: any = { isActive: true };

        if (searchByModel) {
          where.model = ILike(`%${searchByModel}%`);
        }

        if (make || makeId) {
          where.make = {};
          if (make) where.make.name = ILike(`%${make}%`);
          if (makeId) where.make.id = makeId;
        }

        if (category || categoryId) {
          where.category = {};
          if (category) where.category.name = ILike(`%${category}%`);
          if (categoryId) where.category.id = categoryId;
        }


        const cars: Car[] = await carRepo.find({
          where,
          relations: ['make', 'category'],
          order: {
            make: { name: sortOrder},
            category: { name: sortOrder},
            model: sortOrder,
          },
          skip: (page - 1) * limit,
          take: limit,
        });

 
        const total = await carRepo.count({ where, relations: ['make', 'category'] });

        if (!total) {
          throw new NotFoundError('No cars found for the given search criteria', 'RECORD_NOT_FOUND');
        }


        reply.status(200).send(
          createPaginatedResponse(
            cars.map(c => ({
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
