import {FastifyInstance,FastifyReply,FastifyRequest,FastifyPluginOptions,} from "fastify";
import { Banner, Vendor,BannerUserTargetConfig,AdminFile } from "../models/index";
import { CreateBannerBody, UpdateBannerBody,ListBannerQuery } from "./type";
import {createSuccessResponse,createPaginatedResponse,} from "../utils/response";
import { APIError } from "../types/errors";
import { ILike } from "typeorm";
import {
  BannerCategory,
  BannerReviewStatus,
  BannerStatus,
  TargetAudience
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
    listbannerhandler: async (request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const query = request.query as ListBannerQuery
        const { search, page = 1, limit = 10, sortOrder = 'ASC' } = query;
        const bannerRepo = fastify.db.getRepository(Banner);
        const vendorRepo = fastify.db.getRepository(Vendor);

        const where: any = {}
        let finalWhere: any = {}

        if (search) {

          const searchConditions: any[] = [
            { title: ILike(`%${search}%`) },
            { category: ILike(`%${search}%`) },
            { vendor: { name: ILike(`%${search}%`) } },
            { vendor: { vendorCode: ILike(`%${search}%`) } },
          ];
      
          finalWhere = searchConditions;
        } else {
          finalWhere = where; 
        }

        const [banners, total] = await bannerRepo.findAndCount({
          where: finalWhere,
          order: { displaySequence: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          relations: ['vendor']
        });
        const Listbanners = banners.map((banner: any) => ({

          id: banner.id,
          title: banner.title,
          category: banner.category,
          reviewStatus: banner.reviewStatus,
          status: banner.status,
          displaySequence: banner.displaySequence,
          startTime: banner.startTime,
          endTime: banner.endTime,
          vendor: banner.vendor?.name

        }));

        reply.status(200).send(
          createPaginatedResponse(
            Listbanners,
            total,
            page,
            limit
          )
        );
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to fetch banners',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'BANNER_LISTING_FAILED',
          true,
          (error as APIError).publicMessage || 'Failed to fetch banners'
        );
      }
    },
    targetAudienceHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const configRepo = fastify.db.getRepository(BannerUserTargetConfig);
        const adminFileRepo = fastify.db.getRepository(AdminFile);

        const everyone = {
          displayName: TargetAudience.EVERYONE.displayName,
          value: TargetAudience.EVERYONE.value,
          items: []
        };

        const manualFiles = await adminFileRepo.find({
          where: { category: TargetAudience.MANUAL.value, isActive: true },
          relations: ["file"]
        });

        const manualItems = manualFiles.map((f: any) => ({
          isFile: true,
          displayName: f.file.fileName,
          value: f.file.id
        }));

        const manual = {
          displayName: TargetAudience.MANUAL.displayName,
          value: TargetAudience.MANUAL.value,
          items: manualItems
        };

        const specialRules = await configRepo.find({
          where: { category: TargetAudience.SPECIAL_RULE.value, isActive: true }
        });

        const specialItems = specialRules.map((r: any) => ({
          displayName: r.displayText,
          value: r.value
        }));

        const specialRulesResponse = {
          displayName: TargetAudience.SPECIAL_RULE.displayName,
          value: TargetAudience.SPECIAL_RULE.value,
          items: specialItems
        };

        const data = {
          everyone,
          manual,
          specialRules: specialRulesResponse
        };

        reply.status(200).send(
          createSuccessResponse(
            data,
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
