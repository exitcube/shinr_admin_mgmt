import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { UpdateBannerCategoryBody, ListBannerBody, BannerApprovalBody, ListBannerBodySearch } from "./type";
import { Banner, Vendor, BannerCategory, BannerUserTargetConfig, File, AdminFile, BannerAudienceType, BannerUserTarget, User, BannersByLocation, BannerUserTargetConfigType } from "../models";
import { createSuccessResponse, createPaginatedResponse, } from "../utils/response";
import { APIError } from "../types/errors";
import { DeepPartial, EntityManager, ILike, In } from "typeorm";
import {
  BannerReviewStatus,
  BannerStatus,
  TargetAudience, FILE_PROVIDER,
  BANNER_IMAGE_ALLOWED_MIMETYPE, BANNER_IMAGE_MAX_SIZE, ADMIN_FILE_CATEGORY, BANNER_IMAGE_DIMENSION,
  BANNER_APPROVAL_ACTIONS,
  BannerOwner,
} from "../utils/constant";
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { createBannerValidateSchema, updateBannerValidateSchema } from "./validators";
import { fileUpload, parseMultipart, getDimension } from "../utils/fileUpload";
import { deleteStoredFile } from "../utils/fileStorage";
import { getUtcRangeFromTwoIsoDates, getDayBoundariesFromIso } from "../utils/helper";
import {
  deactivateExistingTargetsOfBanner,
  getManualLocationConfig,
  getManualSelectedUserConfig,
  processManualLocationConfig,
  processManualSelectedUserConfig,
  saveFileAndAdminFile
} from "./helper";




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
        const search = (request.query as ListBannerBodySearch).search;
        const {
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
        } = request.body as ListBannerBody || {};
        const bannerRepo = fastify.db.getRepository(Banner);

        const where: any = { isActive: true };

        if (status && Array.isArray(status)) where.status = In(status);
        if (reviewStatus && Array.isArray(reviewStatus)) where.reviewStatus = In(reviewStatus);
        if (categoryId && Array.isArray(categoryId)) where.categoryId = In(categoryId);
        if (owner) where.owner = owner;
        if (owner === BannerOwner.VENDOR && vendorId) {
          if (Array.isArray(vendorId)) where.vendorId = In(vendorId);
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
          vendor: banner.vendor?.name,
          displaySequence: banner.displaySequence,
          startTime: banner.startTime,
          endTime: banner.endTime,
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
    createBannerHandler: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
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

        const uploadResult = await fileUpload(bannerImg, adminId);
        const uploadedFiles: Array<{ provider: string; storageLocation: string }> = [
          {
            provider: uploadResult.provider,
            storageLocation: uploadResult.storageLocation,
          },
        ];
        let newBanner: Banner | null = null;
        try {
          await fastify.db.transaction(async (manager: EntityManager) => {
            const fileRepo = manager.getRepository(File);
            const adminFileRepo = manager.getRepository(AdminFile);
            const bannerRepo = manager.getRepository(Banner);
            const bannerUserTargetConfigRepo = manager.getRepository(BannerUserTargetConfig);
            const bannerAudienceTypeRepo = manager.getRepository(BannerAudienceType);
            const bannerUserTargetRepo = manager.getRepository(BannerUserTarget);
            const userRepo = manager.getRepository(User);
            const bannerLocationRepo = manager.getRepository(BannersByLocation);

            const { adminFile: newAdminFile } = await saveFileAndAdminFile(
              fileRepo,
              adminFileRepo,
              {
                adminId,
                category: ADMIN_FILE_CATEGORY.BANNER,
                uploadResult,
                mimeType: bannerImg.mimetype,
                sizeBytes: bannerImg.sizeBytes,
              }
            );

            const endTimeValue = endTime? new Date(endTime): new Date("2099-01-01");
            const startTimeValue = new Date(startTime as string);

            const bannerPayload: DeepPartial<Banner> = {
              bgImageId: newAdminFile.id,
              title,
              categoryId: categoryId? Number(categoryId) : undefined,
              owner,
              vendorId: vendorId  ? Number(vendorId) : undefined,
              homePageView: Boolean(homePageView),
              displaySequence: priority? Number(priority) : undefined,
              targetValue,
              startTime: startTimeValue,
              endTime: endTimeValue,
              createdBy: adminId,
              status: BannerStatus.DRAFT.value,
              reviewStatus: BannerReviewStatus.PENDING.value,
              isActive: true,
            };
            const createdBanner = bannerRepo.create(bannerPayload);
            await bannerRepo.save(createdBanner);
            newBanner = createdBanner;

            if (targetAudienceId && Array.isArray(targetAudienceId)) {
              const targetAudienceIds = targetAudienceId.map((id: string) =>
                Number(id)
              );
              const targetAudiences = await bannerUserTargetConfigRepo.find({
                where: { id: In(targetAudienceIds), isActive: true },
              });

              if (targetAudiences.length !== targetAudienceIds.length) {
                throw new APIError(
                  "Target audience not found",
                  400,
                  "TARGET_AUDIENCE_INVALID",
                  false,
                  "One or more given target audiences are not available"
                );
              }

              const bannerAudienceMappings = targetAudiences.map((targetAudience: BannerUserTargetConfigType) =>
                bannerAudienceTypeRepo.create({
                  bannerId: createdBanner.id,
                  bannerConfigId: targetAudience.id,
                  isActive: true,
                })
              );
              await bannerAudienceTypeRepo.save(bannerAudienceMappings);

              const manualSelectedUserConfig = getManualSelectedUserConfig(targetAudiences);

              if (manualSelectedUserConfig) {
                await processManualSelectedUserConfig({
                  manualFile: files?.selectedCustomer?.[0],
                  adminId,
                  bannerId: createdBanner.id,
                  fileRepo,
                  adminFileRepo,
                  userRepo,
                  bannerUserTargetRepo,
                  uploadedFiles,
                });
              }

              const manualLocationConfig = getManualLocationConfig(targetAudiences);
              if (manualLocationConfig) {
                await processManualLocationConfig({
                  locationFile: files?.locationFile?.[0],
                  adminId,
                  bannerId: createdBanner.id,
                  fileRepo,
                  adminFileRepo,
                  bannerLocationRepo,
                  uploadedFiles,
                });
              }
            }
          });
        } catch (transactionError) {
          for (const file of uploadedFiles) {
            try {
              await deleteStoredFile(file.provider, file.storageLocation);
            } catch (cleanupError) {
              fastify.log.warn(
                {
                  cleanupError,
                  provider: file.provider,
                  storageLocation: file.storageLocation,
                },
                "Banner create cleanup failed"
              );
            }
          }
          throw transactionError;
        }
        if (!newBanner) {
          throw new APIError(
            "Failed to create banners",
            500,
            "BANNER_CREATING_FAILED",
            true,
            "Failed to Create banners"
          );
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
        const bannerIdValue = Number(bannerId);

        const bannerImg = files?.bannerImage ? files.bannerImage[0] : null;
        const uploadedFiles: Array<{ provider: string; storageLocation: string }> = [];

        try {
          await fastify.db.transaction(async (manager: EntityManager) => {

        const fileRepo = manager.getRepository(File);
        const adminFileRepo = manager.getRepository(AdminFile);
        const bannerRepo = manager.getRepository(Banner);
        const bannerUserTargetConfigRepo = manager.getRepository(
          BannerUserTargetConfig
        );
        const bannerAudienceTypeRepo =
          manager.getRepository(BannerAudienceType);
        const bannerUserTargetRepo = manager.getRepository(BannerUserTarget);
        const bannerLocationRepo = manager.getRepository(BannersByLocation);
        const userRepo = manager.getRepository(User);

        const banner = await bannerRepo.findOne({
          where: { id: bannerIdValue, isActive: true },
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
          await manager.query(
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

          const uploadResult = await fileUpload(bannerImg, adminId);
          uploadedFiles.push({
            provider: uploadResult.provider,
            storageLocation: uploadResult.storageLocation,
          });

        const { adminFile: newAdminFile } = await saveFileAndAdminFile(
          fileRepo,
          adminFileRepo,
          {
            adminId,
            category: ADMIN_FILE_CATEGORY.BANNER,
            uploadResult,
            mimeType: bannerImg.mimetype,
            sizeBytes: bannerImg.sizeBytes,
          }
        );

          banner.bgImageId = newAdminFile.id;
        }
        if (title) banner.title = title;
        if (categoryId) banner.categoryId = Number(categoryId);
        if (owner) banner.owner = owner;
        if (vendorId) {
          const vendorRepo = manager.getRepository(Vendor);
          const vendor = await vendorRepo.findOne({
            where: { id: Number(vendorId), isActive: true },
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
          banner.vendorId = Number(vendorId);
        }
        if (targetValue) banner.targetValue = targetValue;
        if (priority) banner.displaySequence = Number(priority);
        if (startTime) banner.startTime = new Date(startTime);
        if (endTime) banner.endTime = new Date(endTime);
        if (homePageView) {
          banner.homePageView = String(homePageView).toLowerCase() === "true";
        }
        banner.reviewStatus = BannerReviewStatus.PENDING.value;
        banner.status = BannerStatus.DRAFT.value;

        await bannerRepo.save(banner);

        if (targetAudienceId && Array.isArray(targetAudienceId)) {
        const targetAudienceIds = targetAudienceId.map((id: string) =>
            Number(id)
          );
          const targetAudiences = await bannerUserTargetConfigRepo.find({
            where: { id: In(targetAudienceIds), isActive: true },
          });

          if (targetAudiences.length !== targetAudienceIds.length) {
            throw new APIError(
              "Target audience not found",
              400,
              "TARGET_AUDIENCE_INVALID",
              false,
              "The given targetAudience is not found"
            );
          }

          await deactivateExistingTargetsOfBanner(
              banner.id,
              bannerAudienceTypeRepo,
              bannerUserTargetRepo,
              bannerLocationRepo,
              bannerUserTargetConfigRepo
            );
          const newMappings = targetAudiences.map((targetAudience:BannerUserTargetConfig) =>
            bannerAudienceTypeRepo.create({
              bannerId: banner.id,
              bannerConfigId: targetAudience.id,
              isActive: true,
            })
          );

          await bannerAudienceTypeRepo.save(newMappings);

          const manualSelectedUserConfig =
            getManualSelectedUserConfig(targetAudiences);

          if (manualSelectedUserConfig) {
            await processManualSelectedUserConfig({
              manualFile: files?.selectedCustomer?.[0],
              adminId,
              bannerId: banner.id,
              fileRepo,
              adminFileRepo,
              userRepo,
              bannerUserTargetRepo,
              uploadedFiles,
            });
          }

          const manualLocationConfig =
            getManualLocationConfig(targetAudiences);

          if (manualLocationConfig) {
            await processManualLocationConfig({
              locationFile: files?.locationFile?.[0],
              adminId,
              bannerId: banner.id,
              fileRepo,
              adminFileRepo,
              bannerLocationRepo,
              uploadedFiles,
            });
          }
        }

          });
        } catch (transactionError) {
          for (const file of uploadedFiles) {
            try {
              await deleteStoredFile(file.provider, file.storageLocation);
            } catch (cleanupError) {
              fastify.log.warn(
                {
                  cleanupError,
                  provider: file.provider,
                  storageLocation: file.storageLocation,
                },
                "Banner update cleanup failed"
              );
            }
          }
          throw transactionError;
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
    singleBannerHandler: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
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
