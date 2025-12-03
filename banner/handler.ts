import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import {  UpdateBannerCategoryBody, ListBannerQuery } from "./type";
import { Banner, Vendor, BannerCategory,BannerUserTargetConfig ,File,AdminFile,BannerAudienceType} from "../models/index";
import { createSuccessResponse, createPaginatedResponse, } from "../utils/response";
import { APIError } from "../types/errors";
import { ILike } from "typeorm";
import {
  BannerReviewStatus,
  BannerStatus,
  TargetAudience,FILE_PROVIDER,
  BANNER_IMAGE_ALLOWED_MIMETYPE, BANNER_IMAGE_MAX_SIZE, ADMIN_FILE_CATEGORY
} from "../utils/constant";
import { createBannerValidateSchema } from "./validators";
import { fileUpload,parseMultipart } from "../utils/fileUpload";
 

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
          "Failed to fetch statusList"
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
              'isFile', b."isFile",
              'fileFieldName', b."fileFieldName"
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
    },
    listbannerhandler: async (request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const { search, status, reviewStatus, categoryId, vendorId, page = 1, limit = 10, sortOrder = 'ASC' } = request.query as ListBannerQuery
        const bannerRepo = fastify.db.getRepository(Banner);

        const where: any = { isActive: true };

        if (status) where.status = status;
        if (reviewStatus) where.reviewStatus = reviewStatus;
        if (categoryId) where.categoryId = categoryId;
        if (vendorId) where.vendorId = vendorId;

        let finalWhere: any = where;

        if (search) {
          finalWhere = [
            { ...where, title: ILike(`%${search}%`) },
            { ...where, vendor: { name: ILike(`%${search}%`) } },
            { ...where, vendor: { vendorCode: ILike(`%${search}%`) } },
            { ...where, bannerCategory: { displayText: ILike(`%${search}%`) } },
          ];
        } else {
          finalWhere = where;
        }

        const [banners, total] = await bannerRepo.findAndCount({
          where: finalWhere,
          order: { displaySequence: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          relations: ['vendor', 'bannerCategory'],
        });

        const Listbanners = banners.map((banner: any) => ({
          id: banner.id,
          title: banner.title,
          category: banner.bannerCategory?.displayText,
          reviewStatus: banner.reviewStatus,
          status: banner.status,
          displaySequence: banner.displaySequence,
          startTime: banner.startTime,
          endTime: banner.endTime,
          vendor: banner.vendor?.name,
        }));

        reply.status(200).send(
          createPaginatedResponse(Listbanners, total, page, limit)
        );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || 'Failed to fetch banners',
          (error as APIError).statusCode || 500,
          (error as APIError).code || 'BANNER_LISTING_FAILED',
          true,
           'Failed to fetch banners'
        );
      }
    },
    createBannerHandler: async (request: FastifyRequest<{Body:UpdateBannerCategoryBody}>,reply: FastifyReply): Promise<void> => {
      try {
        const adminId = (request as any).user?.userId;
        const { body, files } = await parseMultipart(request);

        const { error } = await createBannerValidateSchema.validate(body);
        if (error) {
          throw new Error(error.message);
        }

        const bannerImg = files.bannerImage[0];
         if (Object.keys(bannerImg).length === 0) {
           throw new Error("bannerImage is required");
         }

         if (!BANNER_IMAGE_ALLOWED_MIMETYPE.includes(bannerImg.mimetype)) {
           throw new Error("bannerImage must be PNG or JPG");
         }
         if (bannerImg.sizeBytes > BANNER_IMAGE_MAX_SIZE) {
           throw new Error("bannerIMage must be less than 5MB");
         }
        const {
          title,
          categoryId,
          owner,
          vendorId,
          targetAudienceId,
          targetValue,
          priority,
          startTime,
          endTime,
          homePageView,
          status,
        } = body;

        
        const filePath = await fileUpload(bannerImg, adminId);

        const fileRepo = fastify.db.getRepository(File);
        const adminFileRepo = fastify.db.getRepository(AdminFile);
        const bannerRepo = fastify.db.getRepository(Banner);
        const bannerUserTargetConfigRepo = fastify.db.getRepository(BannerUserTargetConfig);
        const bannerAudienceTypeRepo =fastify.db.getRepository(BannerAudienceType);

        const newFile = fileRepo.create({
          fileName: bannerImg.filename,
          storageLocation: filePath,
          mimeType: bannerImg.mimetype,
          sizeBytes: bannerImg.sizeBytes,
          provider: FILE_PROVIDER.LOCAL,
          url: `https://yourdomain.com/uploads/${bannerImg.filename}`,
          isActive: true,
        });
        await fileRepo.save(newFile);

        const newAdminFile = adminFileRepo.create({
          adminId,
          fileId: newFile.id,
          category: ADMIN_FILE_CATEGORY.BANNER,
          uploadedBy: adminId,
          isActive: true,
        });
        await adminFileRepo.save(newAdminFile);

        const newBanner = bannerRepo.create({
          bgImageId: newAdminFile.id,
          title,
          categoryId,
          owner,
          vendorId,
          homePageView,
          displaySequence: priority,
          targetValue,
          startTime,
          endTime,
          createdBy: adminId,
          status,
        });
        await bannerRepo.save(newBanner);

        const targetAudience = await bannerUserTargetConfigRepo.findOne({ where: { id: targetAudienceId,isActive:true } });
        const isFile = targetAudience ? targetAudience.isFile : false;
        if (!isFile) {
          const newBannerAudeince = bannerAudienceTypeRepo.create({
            bannerId: newBanner.id,
            bannerConfigId: targetAudienceId,
            isActive: true,
          });
          await bannerAudienceTypeRepo.save(newBannerAudeince);
        }
        reply
          .status(200)
          .send(createSuccessResponse(newBanner, "Banner Created Succefully"));
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to create banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_CREATING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to Create banners"
        );
      }
    },
  };
}
