import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { CreateBannerBody, UpdateBannerCategoryBody } from "./type";
import { Banner, Vendor, BannerCategory,BannerUserTargetConfig } from "../models/index";
import { createSuccessResponse, createPaginatedResponse, } from "../utils/response";
import { APIError } from "../types/errors";
import { ILike } from "typeorm";
import {
  BannerReviewStatus,
  BannerStatus,
  TargetAudience
} from "../utils/constant";

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
    vendorListinghandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
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
    categoryListinghandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const { search, page = 1, limit = 10 } = request.query as any;

        const bannerCategoryRepo = fastify.db.getRepository(BannerCategory);

        const where: any = { isActive: true };
        if (search) {
          where.displayText = ILike(`%${search}%`);
        }

        const [bannerCategories, total] = await bannerCategoryRepo.findAndCount(
          {
            where,
            order: { id: "ASC" },
            skip: (page - 1) * limit,
            take: limit,
          }
        );

        const bannerCategoriesList = bannerCategories.map(
          (v: BannerCategory) => ({
            id: v.id,
            name: v.displayText,
          })
        );

        reply
          .status(200)
          .send(
            createPaginatedResponse(bannerCategoriesList, total, page, limit)
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
    statusListinghandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const statusList = Object.values(BannerStatus).map((s) => ({
          displayName: s.displayValue,
          value: s.value,
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
    updateBannerCategoryHandler: async (request: FastifyRequest<{Body:UpdateBannerCategoryBody}>,reply: FastifyReply): Promise<void> => {
      try {
        const { id, updatingText } = request.body as UpdateBannerCategoryBody;

        const bannercategoryRepo = fastify.db.getRepository(BannerCategory);
        const exists = await bannercategoryRepo.findOne({
          where: { id, isActive: true },
        });
        if (!exists) {
          throw new APIError("Invalid category id", 400, "INVALID_ID", true);
        }
        await bannercategoryRepo.update({ id }, { displayText: updatingText });
        reply
          .status(200)
          .send(
            createSuccessResponse(
              { updated: 1 },
              "banner Category updated Succesfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to update Banner Category",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Banner Category_Updating_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to update Banner Category"
        );
      }
    },
     deleteBannerCategoryHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const id = (request.query as any).id;
        const bannercategoryRepo = fastify.db.getRepository(BannerCategory);
        const exists = await bannercategoryRepo.findOne({
          where: { id, isActive: true },
        });
        if (!exists) {
          throw new APIError("Invalid category id", 400, "INVALID_ID", true);
        }
        await bannercategoryRepo.update({ id }, { isActive: false });
        reply
          .status(200)
          .send(
            createSuccessResponse(
              { deleted: 1 },
              "banner Category deleted Succesfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to delete Banner Category",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Banner Category_Deleting_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to deleted Banner Category"
        );
      }
    },
        targetAudienceHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {

        const bannerUserTargetConfig = fastify.db.getRepository(BannerUserTargetConfig);

        const data = await bannerUserTargetConfig
          .createQueryBuilder("b")
          .select([
            "b.category AS category",
              `json_agg(
            json_build_object(
              'id', b.id,
              'displayText', b.displayText,
              'value', b.value,
              'isFile', b."isFile"
            )
        ) AS items`
          ])
          .where("b.isActive = true")
          .groupBy("b.category")
          .getRawMany();

        const result = data.map((r: any) => {
          const match = TargetAudience[r.category as keyof typeof TargetAudience];
          return {
            category: r.category,
            displayText: match ? match.displayName : r.category, // fallback
            items: r.items
          };
        });
        
        reply.status(200).send(
          createSuccessResponse(
            result,
            "Target audience options fetched successfully"
          )
        );

      } catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to fetch banners',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'BANNER_LISTING_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to fetch banners'
        );
      }
    }
  };
}
