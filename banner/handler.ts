import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import {  UpdateBannerCategoryBody, ListBannerQuery,BannerApprovalBody } from "./type";
import { Banner, Vendor, BannerCategory,BannerUserTargetConfig ,File,AdminFile,BannerAudienceType,BannerUserTarget} from "../models";
import { createSuccessResponse, createPaginatedResponse, } from "../utils/response";
import { APIError } from "../types/errors";
import { ILike } from "typeorm";
import {
  BannerReviewStatus,
  BannerStatus,
  TargetAudience,FILE_PROVIDER,
  BANNER_IMAGE_ALLOWED_MIMETYPE, BANNER_IMAGE_MAX_SIZE, ADMIN_FILE_CATEGORY,  BANNER_IMAGE_DIMENSION,
  BANNER_APPROVAL_ACTIONS,
  BannerOwner
} from "../utils/constant";
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { createBannerValidateSchema,updateBannerValidateSchema } from "./validators";
import { fileUpload,parseMultipart ,getDimension} from "../utils/fileUpload";
import sharp from "sharp";
import { EntityManager } from "typeorm";
import { getUtcRangeFromTwoIsoDates,getDayBoundariesFromIso } from "../utils/helper";

 

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
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
    updateBannerCategoryHandler: async (
      request: FastifyRequest<{ Body: UpdateBannerCategoryBody }>,
      reply: FastifyReply
    ): Promise<void> => {
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
    deleteBannerCategoryHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
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
    targetAudienceHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const bannerUserTargetConfig = fastify.db.getRepository(
          BannerUserTargetConfig
        );

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
        ) AS items`,
          ])
          .where("b.isActive = true")
          .groupBy("b.category")
          .getRawMany();

        const result = data.map((r: any) => {
          const match =
            TargetAudience[r.category as keyof typeof TargetAudience];
          return {
            category: r.category,
            displayText: match ? match.displayName : r.category, // fallback
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
          (error as APIError).message || "Failed to fetch banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_LISTING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to fetch banners"
        );
      }
    },
    listbannerhandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const {
          search,
          status,
          reviewStatus,
          categoryId,
          vendorId,
          owner,
          startTime,
          endTime,
          page = 1,
          limit = 10,
          sortOrder = "ASC",
        } = request.query as ListBannerQuery;
        const bannerRepo = fastify.db.getRepository(Banner);

        const where: any = { isActive: true };

        if (status) where.status = status;
        if (reviewStatus) where.reviewStatus = reviewStatus;
        if (categoryId) where.categoryId = categoryId;
        if (owner) where.owner = owner;
        if (owner === BannerOwner.VENDOR && vendorId) {
          where.vendorId = vendorId;
        }
        if (startTime && endTime) {
          const { utcStart, utcEnd } = getUtcRangeFromTwoIsoDates(startTime, endTime);
          where.startTime = MoreThanOrEqual(utcStart);
          where.endTime = LessThanOrEqual(utcEnd);
        } else if (startTime) {
          const { utcStart } = getDayBoundariesFromIso(startTime);
          where.startTime = MoreThanOrEqual(utcStart);
        } else if (endTime) {
          const { utcEnd } = getDayBoundariesFromIso(endTime);
          where.endTime = LessThanOrEqual(utcEnd);
        }

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
          relations: ["vendor", "bannerCategory"],
        });

        const Listbanners = banners.map((banner: any) => ({
          id: banner.id,
          title: banner.title,
          category: banner.bannerCategory?.displayText,
          reviewStatus: banner.reviewStatus,
          status: banner.status,
          owner: banner.owner,
          displaySequence: banner.displaySequence,
          startTime: banner.startTime,
          endTime: banner.endTime,
          vendor: banner.vendor?.name,
        }));

        reply
          .status(200)
          .send(createPaginatedResponse(Listbanners, total, page, limit));
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_LISTING_FAILED",
          true,
          "Failed to fetch banners"
        );
      }
    },
    createBannerHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const adminId = (request as any).user?.userId;
        const { body, files } = await parseMultipart(request);

        const { error } = await createBannerValidateSchema.validate(body);
        if (error) {
          throw new Error(error.message);
        }

        const bannerImg = files.bannerImage[0];

        const { width, height } = await getDimension(bannerImg);

        if (
          width !== BANNER_IMAGE_DIMENSION.WIDTH ||
          height !== BANNER_IMAGE_DIMENSION.HEIGHT
        ) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_DIMENSION_INVALID",
            false,
            "Image must be exactly 272 × 230 pixels."
          );
        }

        if (Object.keys(bannerImg).length === 0) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_NOT_FOUND",
            false,
            "Image file is required."
          );
        }

        if (!BANNER_IMAGE_ALLOWED_MIMETYPE.includes(bannerImg.mimetype)) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_MIMETYPE_INVALID",
            false,
            "Image must be PNG OR JPG pixels."
          );
        }
        if (bannerImg.sizeBytes > BANNER_IMAGE_MAX_SIZE) {
          throw new APIError(
            "Bad Request",
            400,
            "IMAGE_SIZEBYTE_INVALID",
            false,
            "Image must be less than 5MB"
          );
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
        } = body;

        const filePath = await fileUpload(bannerImg, adminId);

        const fileRepo = fastify.db.getRepository(File);
        const adminFileRepo = fastify.db.getRepository(AdminFile);
        const bannerRepo = fastify.db.getRepository(Banner);
        const bannerUserTargetConfigRepo = fastify.db.getRepository(
          BannerUserTargetConfig
        );
        const bannerAudienceTypeRepo =
          fastify.db.getRepository(BannerAudienceType);

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
          isActive: true,
        });
        await adminFileRepo.save(newAdminFile);

        const endTimeValue = endTime
          ? new Date(endTime)
          : new Date("2099-01-01");
        const startTimeValue = new Date(startTime as string) 

        const newBanner = bannerRepo.create({
          bgImageId: newAdminFile.id,
          title,
          categoryId,
          owner,
          vendorId,
          homePageView,
          displaySequence: priority,
          targetValue,
          startTime: startTimeValue,
          endTime: endTimeValue,
          createdBy: adminId,
          status: BannerStatus.DRAFT.value,
          reviewStatus: BannerReviewStatus.PENDING.value,
          isActive: true,
        });
        await bannerRepo.save(newBanner);

        if (targetAudienceId && Array.isArray(targetAudienceId)) {
          for (const id of targetAudienceId) {
            const targetAudience = await bannerUserTargetConfigRepo.findOne({
              where: { id: id, isActive: true },
            });
            if(!targetAudience)
            {
               throw new APIError(
            "Target audience not found",
            400,
            "TARGET_AUDIENCE_INVALID",
            false,
            "the given targetAudience is  is not found"
          );
            }
              const newBannerAudeince = bannerAudienceTypeRepo.create({
                bannerId: newBanner.id,
                bannerConfigId: id,
                isActive: true,
              });
              await bannerAudienceTypeRepo.save(newBannerAudeince);
            
          }
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
    bannerApprovalHandler: async (
      request: FastifyRequest<{ Body: BannerApprovalBody }>,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const adminId = (request as any).user?.userId;

        const { bannerId, action, rejectReason } = request.body as any;
        const bannerRepo = fastify.db.getRepository(Banner);
        const banner = await bannerRepo.findOne({
          where: { id: bannerId, isActive: true },
        });
        if (!banner) {
          throw new APIError(
            "Bad Request",
            400,
            "INVALID_ID",
            false,
            "Invalid banner id"
          );
        }
        if (adminId === banner.createdBy) {
          throw new APIError(
            "Banner reveiwing failed",
            400,
            "UNAUTHORIZED_ACTION",
            false,
            "You cannot approve or reject a banner you created."
          );
        }
        if (
          banner.reviewStatus !== BannerReviewStatus.PENDING.value ||
          banner.status !== BannerStatus.DRAFT.value
        ) {
          throw new APIError(
            "Banner already processed",
            400,
            "INVALID_BANNER_STATUS",
            false,
            "You can not approve/reject this banner anymore"
          );
        }
        banner.reviewStatus =
          action === BANNER_APPROVAL_ACTIONS.APPROVE
            ? BannerReviewStatus.APPROVED.value
            : BannerReviewStatus.REJECTED.value;
        banner.status =
          action === BANNER_APPROVAL_ACTIONS.APPROVE
            ? BannerStatus.ACTIVE.value
            : BannerStatus.DRAFT.value;
        banner.approvedBy = adminId;
        banner.rejectReason =
          action === BANNER_APPROVAL_ACTIONS.REJECT ? rejectReason : null;
        await bannerRepo.save(banner);

        const response =
          action === BANNER_APPROVAL_ACTIONS.APPROVE
            ? { approved: true }
            : { rejected: true };

        reply
          .status(200)
          .send(createSuccessResponse(response, "Banner Approved "));
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to Approve banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_APPROVING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to Approve banners"
        );
      }
    },
    updateBannerHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const adminId = (request as any).user?.userId;
        const { body, files } = await parseMultipart(request);
        const { error } = await updateBannerValidateSchema.validate(body);
        if (error) {
          throw new Error(error.message);
        }

        const {
          bannerId,
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
        } = body;

        const bannerImg = files?.bannerImage ? files.bannerImage[0] : null;

        const fileRepo = fastify.db.getRepository(File);
        const adminFileRepo = fastify.db.getRepository(AdminFile);
        const bannerRepo = fastify.db.getRepository(Banner);
        const bannerUserTargetConfigRepo = fastify.db.getRepository(
          BannerUserTargetConfig
        );
        const bannerAudienceTypeRepo =
          fastify.db.getRepository(BannerAudienceType);
        const bannerUserTargetRepo = fastify.db.getRepository(BannerUserTarget);

        const banner = await bannerRepo.findOne({
          where: { id: bannerId, isActive: true },
        });

        if (!banner) {
          throw new APIError(
            "Bad Request",
            400,
            "INVALID_ID",
            false,
            "Invalid banner id"
          );
        }

        if (banner.status === BannerStatus.EXPIRED.value) {
          throw new APIError(
            "Banneder Editing failed",
            400,
            "INVALID_BaNNER_STATUS",
            false,
            "you cant edit banner which is expired or rejected"
          );
        }

        if (bannerImg) {
          const { width, height } = await getDimension(bannerImg);
          if (
            width !== BANNER_IMAGE_DIMENSION.WIDTH ||
            height !== BANNER_IMAGE_DIMENSION.HEIGHT
          ) {
            throw new APIError(
              "Bad Request",
              400,
              "IMAGE_DIMENSION_INVALID",
              false,
              "Image must be exactly 272 × 230 pixels."
            );
          }
          if (!BANNER_IMAGE_ALLOWED_MIMETYPE.includes(bannerImg.mimetype)) {
            throw new APIError(
              "Bad Request",
              400,
              "IMAGE_MIMETYPE_INVALID",
              false,
              "Image must be PNG OR JPG pixels."
            );
          }
          if (bannerImg.sizeBytes > BANNER_IMAGE_MAX_SIZE) {
            throw new APIError(
              "Bad Request",
              400,
              "IMAGE_SIZEBYTE_INVALID",
              false,
              "Image must be less than 5MB"
            );
          }
          await fastify.db.query(
            `
  WITH updated_admin AS (
    UPDATE "adminFile"
    SET "isActive" = false
    WHERE id = $1
    AND "isActive" = true
    RETURNING "fileId"
  )
  UPDATE file
  SET "isActive"= false
  WHERE id = (SELECT "fileId" FROM updated_admin);
  `,
            [banner.bgImageId]
          );

          const filePath = await fileUpload(bannerImg, adminId);

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
            isActive: true,
          });
          await adminFileRepo.save(newAdminFile);

          banner.bgImageId = newAdminFile.id;
        }
        if (title) banner.title = title;
        if (categoryId) banner.categoryId = categoryId;
        if (owner) banner.owner = owner;
        if (vendorId) {
          const vendorRepo = fastify.db.getRepository(Vendor);
          const vendor = await vendorRepo.findOne({
            where: { id: vendorId, isActive: true },
          });
          if (!vendor) {
            throw new APIError(
              "vendor updating failed",
              400,
              "VENDOR_ID_INVALID",
              false,
              "Vendor Doesnt Exist"
            );
          }
          banner.vendorId = vendorId;
        }
        if (targetValue) banner.targetValue = targetValue;
        if (priority) banner.displaySequence = priority;
        if (startTime) banner.startTime = new Date(startTime);
        if (endTime) banner.endTime = new Date(endTime);
        if (homePageView) banner.homePageView = homePageView;
        banner.reviewStatus = BannerReviewStatus.PENDING.value;
        banner.status = BannerStatus.DRAFT.value;

        await bannerRepo.save(banner);

        if (targetAudienceId && Array.isArray(targetAudienceId)) {
          await bannerAudienceTypeRepo.update(
            { bannerId: banner.id },
            { isActive: false }
          );
          await bannerUserTargetRepo.update(
            { bannerId: banner.id },
            { isActive: false }
          );
          for (const id of targetAudienceId) {
            const targetAudience = await bannerUserTargetConfigRepo.findOne({
              where: { id: id, isActive: true },
            });
            if(!targetAudience)
            {
               throw new APIError(
            "Target audience not found",
            400,
            "TARGET_AUDIENCE_INVALID",
            false,
            "the given targetAudience is  is not found"
          );
            }
              const newBannerAudeince = bannerAudienceTypeRepo.create({
                bannerId: banner.id,
                bannerConfigId: id,
                isActive: true,
              });
              await bannerAudienceTypeRepo.save(newBannerAudeince);
            
          }
        }

        reply
          .status(200)
          .send(
            createSuccessResponse(
              { updated: true },
              "Banner updated Succefully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to update banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_UPDATING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to update banners"
        );
      }
    },
    singleBannerHandler: async (request: FastifyRequest,reply: FastifyReply): Promise<void> => {
      try {
        const bannerId = (request.params as any).id;
    

        const bannerRepo = fastify.db.getRepository(Banner);

        const banner = await bannerRepo.findOne({
          where: { id: bannerId, isActive: true },
          relations: [
            "vendor",
            "bannerCategory",
            "adminFile",
            "adminFile.file",
          ],
        });
        const audienceTypeRepo = fastify.db.getRepository(BannerAudienceType);
        const bannerUserTargetConfigRepo = fastify.db.getRepository(BannerUserTargetConfig);
        const audienceTypes = await audienceTypeRepo.find({
          where: { bannerId: bannerId, isActive: true },
        });
        const targetAudienceDetails = [];
        for (const audienceType of audienceTypes) {
          const config = await bannerUserTargetConfigRepo.findOne({
            where: { id: audienceType.bannerConfigId, isActive: true },
          });
          if (config) {
            targetAudienceDetails.push({
              id: config.id,
              displayText: config.displayText,
              category: config.category,
              value: config.value,
              isFile: config.isFile,
              fileFieldName: config.fileFieldName,
            });
          }
        }
        const response = {
          id: banner?.id,
          bannerImageUrl: banner?.adminFile?.file?.url,
          title: banner?.title,
          category: {
            id: banner?.bannerCategory?.id,
            displayText: banner?.bannerCategory?.displayText,
          },
          owner: banner?.owner,
          vendor: {
            id: banner?.vendor?.id,
            name: banner?.vendor?.name,
          },
          targetValue: banner?.targetValue,
          priority: banner?.displaySequence,
          startTime: banner?.startTime,
          endTime: banner?.endTime,
          homePageView: banner?.homePageView,
          reviewStatus: banner?.reviewStatus,
          targetAudienceDetails: targetAudienceDetails,
        };

        reply
          .status(200)
          .send(
            createSuccessResponse(response, "single Banner fetched Succefully")
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch Single banners",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "SINGLE BANNER_FETCHING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to fetch banners"
        );
      }
    },
    deleteBannerHandler: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        const adminId = (request as any).user?.userId;
        const id = (request.params as any).id;
        const bannerRepo = fastify.db.getRepository(Banner);

        const existingBanner = await bannerRepo.findOne({
          where: { id, isActive: true },
        });
        if (!existingBanner) {
          throw new APIError("Invalid banner id", 400, "INVALID_ID", true);
        }

        await fastify.db.query(
          `
        WITH updated_banner AS (
          UPDATE banner
          SET
            "isActive" = false,
            "removedBy" = $2
          WHERE id = $1
          AND "isActive" = true
          RETURNING id
        ),
        updated_audience AS (
          UPDATE "bannerAudienceType"
          SET "isActive" = false
          WHERE "bannerId" = (SELECT id FROM updated_banner)
          RETURNING "bannerId"
        )
        UPDATE "bannerUserTarget"
        SET "isActive" = false
        WHERE "bannerId" = (SELECT id FROM updated_banner);
        `,
          [id, adminId]
        );
        reply
          .status(200)
          .send(createSuccessResponse({ deleted: 1 }, "Banner Deleted Successfully"));
      }
      catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to delete Banner",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "Banner_Deleting_FAILED",
          true,
          (error as APIError).publicMessage ||
          "Failed to delete Banner"
        );
      }
    },
  };
}
