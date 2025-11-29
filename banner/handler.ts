import {FastifyInstance,FastifyReply,FastifyRequest,FastifyPluginOptions,} from "fastify";
import { Banner, Vendor, AdminFile } from "../models/index";
import { CreateBannerBody, UpdateBannerBody, ApproveBannerBody } from "./type";
import {createSuccessResponse,createPaginatedResponse,} from "../utils/response";
import { APIError, NotFoundError } from "../types/errors";
import { ILike } from "typeorm";
import {
  BannerCategory,
  BannerReviewStatus,
  BannerStatus,
} from "../utils/constant";
import { AdminAuthenticatedUser } from "../types/config";

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
    createBannerHandler: async (
      request: FastifyRequest<{ Body: CreateBannerBody }>,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const {
          text,
          bgColour,
          bgImageId,
          buttonText,
          targetValue,
          title,
          category,
          owner,
          vendorId,
          homePageView,
          displaySequence,
          startTime,
          endTime,
          buttonColour,
        } = request.body;

        const user = (request as any).user as AdminAuthenticatedUser;
        const bannerRepo = fastify.db.getRepository(Banner);

        // Validate bgImageId if provided
        let parsedBgImageId: number | null = null;
        if (bgImageId) {
          parsedBgImageId = typeof bgImageId === 'string' ? parseInt(bgImageId) : bgImageId;
          if (isNaN(parsedBgImageId)) {
            throw new APIError(
              "Invalid bgImageId format",
              400,
              "INVALID_BG_IMAGE_ID_FORMAT",
              true,
              "bgImageId must be a valid number"
            );
          }
          const adminFileRepo = fastify.db.getRepository(AdminFile);
          const adminFile = await adminFileRepo.findOne({
            where: { id: parsedBgImageId },
          });
          if (!adminFile) {
            throw new APIError(
              "Invalid bgImageId",
              400,
              "INVALID_BG_IMAGE_ID",
              true,
              "The provided background image ID does not exist"
            );
          }
        }

        // Validate vendorId if provided
        let parsedVendorId: number | null = null;
        if (vendorId) {
          parsedVendorId = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
          if (isNaN(parsedVendorId)) {
            throw new APIError(
              "Invalid vendorId format",
              400,
              "INVALID_VENDOR_ID_FORMAT",
              true,
              "vendorId must be a valid number"
            );
          }
          const vendorRepo = fastify.db.getRepository(Vendor);
          const vendor = await vendorRepo.findOne({
            where: { id: parsedVendorId },
          });
          if (!vendor) {
            throw new APIError(
              "Invalid vendorId",
              400,
              "INVALID_VENDOR_ID",
              true,
              "The provided vendor ID does not exist"
            );
          }
        }

        // Determine if banner is image-based
        const isImage = !!parsedBgImageId;

        // Create banner
        const banner = bannerRepo.create({
          text: text || null,
          bgColour: bgColour || null,
          bgImageId: parsedBgImageId,
          isImage,
          buttonText,
          targetValue,
          title,
          category: category || null,
          owner: owner || null,
          vendorId: parsedVendorId,
          homePageView: homePageView ?? false,
          displaySequence: displaySequence || null,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          buttonColour: buttonColour || null,
          createdBy: user.userId,
          status: BannerStatus.DRAFT.value,
          reviewStatus: BannerReviewStatus.PENDING.value,
          isActive: true,
        });

        const savedBanner = await bannerRepo.save(banner);

        reply
          .status(201)
          .send(
            createSuccessResponse(
              savedBanner,
              "Banner created successfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to create banner",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_CREATION_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to create banner"
        );
      }
    },
    approveBannerHandler: async (
      request: FastifyRequest<{ Body: ApproveBannerBody; Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const { id } = request.params;
        const { status } = request.body || {};
        const user = (request as any).user as AdminAuthenticatedUser;

        const bannerId = parseInt(id);
        if (isNaN(bannerId)) {
          throw new APIError(
            "Invalid banner ID",
            400,
            "INVALID_BANNER_ID",
            true,
            "Please provide a valid banner ID"
          );
        }

        const bannerRepo = fastify.db.getRepository(Banner);
        const banner = await bannerRepo.findOne({
          where: { id: bannerId },
        });

        if (!banner) {
          throw new NotFoundError(
            "Banner not found",
            "BANNER_NOT_FOUND"
          );
        }

        // Update banner
        await bannerRepo.update(bannerId, {
          reviewStatus: BannerReviewStatus.APPROVED.value,
          approvedBy: user.userId,
          status: status || BannerStatus.ACTIVE.value,
          updatedBy: user.userId,
        });

        const updatedBanner = await bannerRepo.findOne({
          where: { id: bannerId },
        });

        reply
          .status(200)
          .send(
            createSuccessResponse(
              updatedBanner,
              "Banner approved successfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to approve banner",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_APPROVAL_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to approve banner"
        );
      }
    },
    deleteBannerHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> => {
      try {
        const { id } = request.params;

        const bannerId = parseInt(id);
        if (isNaN(bannerId)) {
          throw new APIError(
            "Invalid banner ID",
            400,
            "INVALID_BANNER_ID",
            true,
            "Please provide a valid banner ID"
          );
        }

        const bannerRepo = fastify.db.getRepository(Banner);
        const banner = await bannerRepo.findOne({
          where: { id: bannerId },
        });

        if (!banner) {
          throw new NotFoundError(
            "Banner not found",
            "BANNER_NOT_FOUND"
          );
        }

        // Soft delete by setting isActive to false
        await bannerRepo.update(bannerId, {
          isActive: false,
        });

        reply
          .status(200)
          .send(
            createSuccessResponse(
              { id: bannerId, deleted: true },
              "Banner deleted successfully"
            )
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to delete banner",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "BANNER_DELETION_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to delete banner"
        );
      }
    },
  };
}
