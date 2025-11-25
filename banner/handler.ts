import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Banner } from '../models/index';
import { CreateBannerBody } from './type';
import { createSuccessResponse,createPaginatedResponse} from '../utils/response';
import { APIError } from '../types/errors';
import { BannerFilterBody } from './type';
import { ILike } from 'typeorm';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions):any {
  return {
    filterBannerHandler: async (request: FastifyRequest,reply: FastifyReply) => {
      try {
        const {
          vendorId,
          searchByCategory,
          status,
          reviewStatus,
          startTime,
          endTime,
          limit = 10,
          page = 1,
          sortOrder = "asc",
        } = request.query as BannerFilterBody;

        const bannerRepo = fastify.db.getRepository(Banner);

        const where: any = {};

        if (searchByCategory) {
          where.category = ILike(`%${searchByCategory}%`);
        }

        if(vendorId)
        {
            where.vendorId=vendorId;
        }

        if (reviewStatus) {
          where.reviewStatus = reviewStatus;
        }

        if (status) {
          where.status = status;
        }

        if (startTime) {
          where.startTime = new Date(startTime);
        }
        if (endTime) {
          where.endTime = new Date(endTime);
        }
        const [banners, total] = await bannerRepo.findAndCount({
          where,
          order: { category: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        });

        const bannerList = banners.map((b: Banner) => ({
          id: b.id,
          title: b.title,
          category: {
            displayName: b.category
              .replace(/_/g, " ")
              .toUpperCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: b.category,
          },
          status: {
            displayName: b.status
              .toUpperCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: b.status,
          },

          reviewStatus: {
            displayName: b.reviewStatus
              .toUpperCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: b.reviewStatus,
          },

          startTime: {
            displayName: b.startTime,
            value: b.startTime,
          },

          endTime: {
            displayName: b.endTime,
            value: b.endTime,
          },
        }));
        reply
          .status(200)
          .send(createPaginatedResponse(bannerList, total, page, limit));
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to filter banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Banner_FILTER_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to FILTER BANNER"
        );
      }
    },
  };
}