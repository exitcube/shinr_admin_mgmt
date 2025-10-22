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
          where.make = {id: makeId };
        }

        if (categoryId) {
          where.category = { id: categoryId };
        }


        const [cars, total] = await carRepo.findAndCount({
          where,
          relations: ['make', 'category'],
          select:['id','model'],
          order: { model: sortOrder},
          skip: (page - 1) * limit,
          take: limit,
        });

        cars.forEach((c:Car) => {
          c.make = {} as any;
          c.category = {} as any;
        });
        
        if (!total) {
          throw new NotFoundError('No cars found for the given search criteria', 'RECORD_NOT_FOUND');
        }
        
        reply.status(200).send(
          createPaginatedResponse(
            cars.map(({ id, model }: Car) => ({ id, model })),
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
