import {FastifyInstance,FastifyReply,FastifyRequest,FastifyPluginOptions,} from "fastify";
import { Banner, Vendor } from "../models/index";
import { CreateBannerBody, UpdateBannerBody } from "./type";
import {createSuccessResponse,createPaginatedResponse,} from "../utils/response";
import { APIError } from "../types/errors";
import { ILike } from "typeorm";
import {
  BannerCategory,
  BannerReviewStatus,
  BannerStatus,
} from "../utils/constant";

export default function controller(fastify: FastifyInstance,opts: FastifyPluginOptions): any {
  return {
    vendorListinghandler: async ( request: FastifyRequest<{ Body: CreateBannerBody }>, reply: FastifyReply): Promise<void> => {
      try {
        const { search, page = 1, limit = 10 } = request.query as any;

        const vendorRepo = fastify.db.getRepository(Vendor);

        const where: any = {};
        if (search) {
          where.name = ILike(`%${search}%`);
        }

        const [vendors, total] = await vendorRepo.findAndCount({
          where,
          order: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        });

        const vendorList = vendors.map((v: Vendor) => ({
          id: v.id,
          name: v.name,
        }));

        reply
          .status(200)
          .send(createPaginatedResponse(vendorList, total, page, limit));
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to search Vendors",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Vendor_Searching_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to search vendors"
        );
      }
    },
    categoryListinghandler: async (request: FastifyRequest<{ Body: CreateBannerBody }>,reply: FastifyReply): Promise<void> => {
      try {
        const { search, page = 1, limit = 10 } = request.query as any;

        let categoryList = Object.values(BannerCategory);
        if (search) {
          categoryList = categoryList.filter((c) =>
            c.displayValue.toLowerCase().includes(search.toLowerCase())
          );
        }
       const finalResponse = categoryList.map((s) => ({
          displayName: s.displayValue,
          value: s.value,
        }));

        reply
          .status(200)
          .send(
            createPaginatedResponse(
              finalResponse,
              categoryList.length,
              page,
              limit
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to search Category",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Category_Fetching_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to FetchCategory vendors"
        );
      }
    },
    statusListinghandler: async (request: FastifyRequest<{ Body: CreateBannerBody }>,reply: FastifyReply): Promise<void> => {
      try {
        const statusList = Object.values(BannerStatus).map((s) => ({
          displayName: s.displayValue,
          value: s.value
        }));
        const reviewStatusList = Object.values(BannerReviewStatus).map((s) => ({
          displayName: s.displayValue,
          value: s.value,
        }));

        reply
          .status(200)
          .send(
            createSuccessResponse(
              { statusList, reviewStatusList },
              "Status ans review List fetched succesfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch status List",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "StatusList_Fetching_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to fetch statusList"
        );
      }
    },
  };
}
