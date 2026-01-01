import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { ILike } from "typeorm";
import { RewardCategory,RewardUserTargetConfig } from "../models/index";
import { createSuccessResponse, createPaginatedResponse, } from "../utils/response";
import { APIError } from "../types/errors";
import { Service } from "../models/index";
import { TargetAudience } from "../utils/constant";



export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
    categoryListingHandler: async (
          request: FastifyRequest,
          reply: FastifyReply
        ): Promise<void> => {
          try {
            const { search, page = 1, limit = 10 } = request.query as any;
    
            const rewardCategoryRepo = fastify.db.getRepository(RewardCategory);
    
            const where: any = { isActive: true };
            if (search) {
              where.displayText = ILike(`%${search}%`);
            }
    
            const [rewardCategories, total] = await rewardCategoryRepo.findAndCount(
              {
                where,
                order: { id: "ASC" },
                skip: (page - 1) * limit,
                take: limit,
              }
            );
    
            const rewardCategoriesList = rewardCategories.map(
              (v: RewardCategory) => ({
                id: v.id,
                name: v.displayText,
              })
            );
    
            reply
              .status(200)
              .send(
                createPaginatedResponse(rewardCategoriesList, total, page, limit)
              );
          } catch (error) {
            throw new APIError(
              (error as APIError).message || "Failed to search Category",
              (error as APIError).statusCode || 500,
              (error as APIError).code || "Category_Fetching_FAILED",
              true,
              (error as APIError).publicMessage || "Failed to FetchCategory rewards"
            );
          }
        },
         serviceCategoryListingHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
          try {
            const { search, page = 1, limit = 10 } = request.query as any;
    
            const serviceRepo = fastify.db.getRepository(Service);
    
            const where: any = { isActive: true };
            if (search) {
              where.displayName = ILike(`%${search}%`);
            }
    
            const [services, total] = await serviceRepo.findAndCount(
              {
                where,
                order: { id: "ASC" },
                skip: (page - 1) * limit,
                take: limit,
              }
            );
    
            const servicesList = services.map(
              (v: Service) => ({
                id: v.id,
                name: v.displayName,
              })
            );
    
            reply
              .status(200)
              .send(
                createPaginatedResponse(servicesList, total, page, limit)
              );
          } catch (error) {
            throw new APIError(
              (error as APIError).message || "Failed to search Category",
              (error as APIError).statusCode || 500,
              (error as APIError).code || "Category_Fetching_FAILED",
              true,
              (error as APIError).publicMessage || "Failed to FetchCategory rewards"
            );
          }
        },
    targetAudienceHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const rewardUserTargetConfigRepo = fastify.db.getRepository(RewardUserTargetConfig);
        const data = await rewardUserTargetConfigRepo
          .createQueryBuilder("r")
          .select([
            "r.category AS category",
            `json_agg(
            json_build_object(
              'id', r.id,
              'displayText', r.displayText,
              'value', r.value,
              'isFile', r."isFile",
              'fileFieldName', r."fileFieldName"
            )
        ) AS items`,
          ])
          .where("r.isActive = true")
          .groupBy("r.category")
          .getRawMany();

        const result = data.map((r: any) => {
          const match =
            TargetAudience[r.category as keyof typeof TargetAudience];
          return {
            category: r.category,
            displayText: match ? match.displayName : r.category,
            items: r.items,
          };
        });

        reply
          .status(200)
          .send(
            createSuccessResponse(
              result,
              "Target audience options fetched successfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch rewards",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "REWARD_LISTING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to fetch rewards"
        );
      }
    },
  }
}
