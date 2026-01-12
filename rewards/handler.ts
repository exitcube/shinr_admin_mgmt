import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { ILike } from "typeorm";
import { Reward,RewardCategory,RewardAudienceType,RewardContribution,RewardServiceType,RewardUserTargetConfig,RewardUserTarget,Service, RewardOfferType ,ServiceType} from "../models/index";
import { createSuccessResponse, createPaginatedResponse, } from "../utils/response";
import { APIError } from "../types/errors";
import { CreateRewardBody,UpdateRewardBody,ListRewardQuery } from "./type";
import { RewardOwner, TargetAudience } from '../utils/constant';
import { In, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { getDayBoundariesFromIso, getUtcRangeFromTwoIsoDates } from "../utils/helper";



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
    createRewardHandler: async (request: FastifyRequest<{Body:CreateRewardBody}>,reply: FastifyReply): Promise<void> => {
      try {
        const { owner, vendorId,title, sideText, summary, description,
          rewardCategoryId, serviceCategoryIds, displayCouponPage, displayVendorPage, offerType, percentage,
          maxDiscountAmount, minOrderValue, codeGeneration, priority, targetAudienceIds, startDate, endDate,
          totalGrabLimit, contribution, shinrPercentage, vendorPercentage, maxUsage, maxUsagePeriod,
          maxUsagePeriodValue, status } = request.body as CreateRewardBody;

        const adminId = (request as any).user?.userId;
        const rewardRepo = fastify.db.getRepository(Reward);
        const serviceRepo = fastify.db.getRepository(Service);
        const rewardServiceTypeRepo = fastify.db.getRepository(RewardServiceType);
        const rewardOfferTypeRepo = fastify.db.getRepository(RewardOfferType);
        const rewardContributorRepo = fastify.db.getRepository(RewardContribution);
        const rewardAudienceTypeRepo = fastify.db.getRepository(RewardAudienceType);
        const rewardUserTargetConfigRepo = fastify.db.getRepository(RewardUserTargetConfig);
         
          

        const newReward = rewardRepo.create({
          title,
          description,
          summary,
          sideText,
          categoryId: rewardCategoryId,
          displaySequence: priority,
          owner,
          vendorId:vendorId??null,
          dispCouponPage:displayCouponPage,
          dispVendorPage:displayVendorPage,
          singleCode: codeGeneration,
          minOrderValue,
          startDate:new Date(startDate),
          endDate: endDate?new Date(endDate):new Date("2099-01-01"),
          grabLimit: totalGrabLimit,
          maxUsage,
          maxUsagePeriod,
          maxUsagePeriodValue,
          createdBy: adminId,
          status,
          isActive: true,
        });
 
        const newOfferType = rewardOfferTypeRepo.create({
          offerType,
          percentage: percentage ?? null,
          maxAmount: maxDiscountAmount,
          isActive:true,
        });

        await rewardOfferTypeRepo.save(newOfferType);


        const newContribution = rewardContributorRepo.create({
          contributor: contribution,
          shinrPercentage: shinrPercentage ?? null,
          vendorPercentage: vendorPercentage ?? null,
          isActive:true,
        });

        await rewardContributorRepo.save(newContribution);

        newReward.rewardOfferTypeId = newOfferType.id;
        newReward.rewardContributorId = newContribution.id;

        await rewardRepo.save(newReward);
         

        if (serviceCategoryIds && Array.isArray(serviceCategoryIds)) {

          const services:Service[] = await serviceRepo.find({
            where: {
              id: In(serviceCategoryIds),
              isActive: true,
            },
          });

          if (services.length !== serviceCategoryIds.length) {
            throw new APIError(
              "service not found",
              400,
              "TARGET_SERVICE_INVALID",
              false,
              "One or more given services are not available"
            );
          }

          const rewardServiceTypes = services.map(service=>
            rewardServiceTypeRepo.create({
              rewardId: newReward.id,
              serviceId: service.id,
              isActive: true,
            })
          );

          await rewardServiceTypeRepo.save(rewardServiceTypes);
        }

        if (targetAudienceIds && Array.isArray(targetAudienceIds)) {
          const targetAudiences:RewardUserTargetConfig[] = await rewardUserTargetConfigRepo.find({
            where: {
              id: In(targetAudienceIds),
              isActive: true,
            },
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

          const rewardAudienceTypes = targetAudiences.map(targetAudience =>
            rewardAudienceTypeRepo.create({
              rewardId: newReward.id,
              rewardConfigId: targetAudience.id,
              isActive: true,
            })
          );

          await rewardAudienceTypeRepo.save(rewardAudienceTypes);
        }

        reply
          .status(200)
          .send(createSuccessResponse(newReward, "reward Created Succefully"));

      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to create rewards",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "REWARD_CREATING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to Create Reward"
        );

      }
    },
    updateRewardHandler: async (request: FastifyRequest<{Body:UpdateRewardBody}>,reply: FastifyReply): Promise<void> => {
      try {
        const { rewardId, owner, vendorId, title, sideText, summary, description,
          rewardCategoryId, serviceCategoryIds, displayCouponPage, displayVendorPage, offerType, percentage,
          maxDiscountAmount, minOrderValue, codeGeneration, priority, targetAudienceIds, startDate, endDate,
          totalGrabLimit, contribution, shinrPercentage, vendorPercentage, maxUsage, maxUsagePeriod,
          maxUsagePeriodValue, status } = request.body as UpdateRewardBody;

        const adminId = (request as any).user?.userId;
        const rewardRepo = fastify.db.getRepository(Reward);
        const serviceRepo = fastify.db.getRepository(Service);
        const rewardServiceTypeRepo = fastify.db.getRepository(RewardServiceType);
        const rewardOfferTypeRepo = fastify.db.getRepository(RewardOfferType);
        const rewardContributorRepo = fastify.db.getRepository(RewardContribution);
        const rewardAudienceTypeRepo = fastify.db.getRepository(RewardAudienceType);
        const rewardUserTargetConfigRepo = fastify.db.getRepository(RewardUserTargetConfig);

        const existingReward = await rewardRepo.findOne({ where: { id: rewardId, isActive: true } });
        if (!existingReward) {
          throw new APIError(
            "Reward not found",
            400,
            "REWARD_NOT_FOUND",
            false,
            "the given reward is not found"
          );
        }
        existingReward.updatedBy=adminId;
        if (title) existingReward.title = title;
        if (description) existingReward.description = description;
        if (summary) existingReward.summary = summary;
        if (sideText) existingReward.sideText = sideText;
        if (rewardCategoryId) existingReward.categoryId = rewardCategoryId;
        if (priority) existingReward.displaySequence = priority;
        if (owner) existingReward.owner = owner;
        if (vendorId) existingReward.vendorId = vendorId;
        if (displayCouponPage) existingReward.dispCouponPage = displayCouponPage;
        if (displayVendorPage) existingReward.dispVendorPage = displayVendorPage;
        if (codeGeneration) existingReward.singleCode = codeGeneration;
        if (minOrderValue) existingReward.minOrderValue = minOrderValue;
        if (startDate) existingReward.startDate = new Date(startDate);
        if (endDate) existingReward.endDate = new Date(endDate);
        if (totalGrabLimit) existingReward.grabLimit = totalGrabLimit;
        if (maxUsage) existingReward.maxUsage = maxUsage;
        if (maxUsagePeriod) existingReward.maxUsagePeriod = maxUsagePeriod;
        if (maxUsagePeriodValue) existingReward.maxUsagePeriodValue = maxUsagePeriodValue;
        if (status) existingReward.status = status;
        if (offerType) {
          const existingOfferType = await rewardOfferTypeRepo.update({ id: existingReward.rewardOfferTypeId }, { isActive: false });
          const newOfferType = await rewardOfferTypeRepo.create({
            offerType: offerType,
            isActive: true,
          })
          if (percentage) newOfferType.percentage = percentage;
          if (maxDiscountAmount) newOfferType.maxAmount = maxDiscountAmount;
          await rewardOfferTypeRepo.save(newOfferType);
          existingReward.rewardOfferTypeId = newOfferType.id;
        }

        if (contribution) {
          const existingContribution = await rewardContributorRepo.update({ id: existingReward.rewardContributorId }, { isActive: false });
          const newContribution = await rewardContributorRepo.create({
            contributor: contribution,
            shinrPercentage: shinrPercentage??null,
            vendorPercentage: vendorPercentage??null,
            isActive: true,
          })
          await rewardContributorRepo.save(newContribution);

          existingReward.rewardContributorId = newContribution.id;
        }
        await rewardRepo.save(existingReward);

        if (serviceCategoryIds && Array.isArray(serviceCategoryIds)) {
          const existingRewardServiceTypes = await rewardServiceTypeRepo.update({ rewardId: rewardId }, { isActive: false });
          const services: Service[] = await serviceRepo.find({
            where: {
              id: In(serviceCategoryIds),
              isActive: true,
            },
          });

          if (services.length !== serviceCategoryIds.length) {
            throw new APIError(
              "service not found",
              400,
              "TARGET_SERVICE_INVALID",
              false,
              "One or more given services are not available"
            );
          }

          const rewardServiceTypes = services.map(service =>
            rewardServiceTypeRepo.create({
              rewardId: rewardId,
              serviceId: service.id,
              isActive: true,
            })
          );

          await rewardServiceTypeRepo.save(rewardServiceTypes);

        }

        if (targetAudienceIds && Array.isArray(targetAudienceIds)) {
          const existingRewardAudienceTypes = await rewardAudienceTypeRepo.update({ rewardId: rewardId }, { isActive: false });
          const targetAudiences: RewardUserTargetConfig[] = await rewardUserTargetConfigRepo.find({
            where: {
              id: In(targetAudienceIds),
              isActive: true,
            },
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

          const rewardAudienceTypes = targetAudiences.map(targetAudience =>
            rewardAudienceTypeRepo.create({
              rewardId: rewardId,
              rewardConfigId: targetAudience.id,
              isActive: true,
            })
          );

          await rewardAudienceTypeRepo.save(rewardAudienceTypes);

        }
          
        reply
          .status(200)
          .send(createSuccessResponse(existingReward, "reward Updated Succefully"));


      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to update rewards",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "REWARD_UPDATING_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to Update Reward"
        );
      }
    },
    singleRewardHandler: async (request: FastifyRequest,reply: FastifyReply) => {
      try {
        const rewardId = (request.params as any).id;

        const rewardRepo = fastify.db.getRepository(Reward);

        const reward = await rewardRepo.findOne({
          where: { id: rewardId, isActive: true },
          relations: ["rewardCategory", "rewardOfferType", "rewardContributor", "vendor"],
        });
        const audienceTypeRepo = fastify.db.getRepository(RewardAudienceType);
        const rewardUserTargetConfigRepo = fastify.db.getRepository(RewardUserTargetConfig);
        const audienceTypes = await audienceTypeRepo.find({
          where: { id: rewardId, isActive: true },
        });
        const targetAudienceDetails = [];
        for (const audienceType of audienceTypes) {
          const config = await rewardUserTargetConfigRepo.findOne({
            where: { id: audienceType.rewardUserTargetConfigId, isActive: true },
          });
          if (config) {
            targetAudienceDetails.push({
              id: config.id,
              displayText: config.displayText,
              value: config.value,
              category: config.category,
              isFile: config.isFile,
              fileFieldName: config.fileFieldName,
            });
          }
        }
        const response = {
          id: reward?.id,
          title: reward?.title,
          description: reward?.description,
          summary: reward?.summary,
          sideText: reward?.sideText,
          category: {
            id: reward?.rewardCategory?.id,
            displayText: reward?.rewardCategory?.displayText,
          },
          offerType: {
            id: reward?.rewardOfferType?.id,
            offerType: reward?.rewardOfferType?.offerType,
            percentage: reward?.rewardOfferType?.percentage,
            maxAmount: reward?.rewardOfferType?.maxAmount,
          },
          contributor: {
            id: reward?.rewardContributor?.id,
            contributor: reward?.rewardContributor?.contributor,
            shinrPercentage: reward?.rewardContributor?.shinrPercentage,
            vendorPercentage: reward?.rewardContributor?.vendorPercentage,
          },
          owner: reward?.owner,
          vendor: {
            id: reward?.vendor?.id,
            name: reward?.vendor?.name,
          },
          targetAudienceDetails: targetAudienceDetails,
          dispCouponPage: reward?.dispCouponPage,
          dispVendorPage: reward?.dispVendorPage,
          minOrderValue: reward?.minOrderValue,
          maxUsage: reward?.maxUsage,
          maxUsagePeriod: reward?.maxUsagePeriod,
          maxUsagePeriodValue: reward?.maxUsagePeriodValue,
          priority: reward?.displaySequence,
          startDate: reward?.startDate,
          endDate: reward?.endDate,
          grabLimit: reward?.grabLimit,
          codeType: reward?.codeType,
          singleCode: reward?.singleCode,
          status: reward?.status,
        };

        reply
          .status(200)
          .send(
            createSuccessResponse(response, "Single Reward fetched Successfully")
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch reward",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "REWARD_FETCH_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to fetch reward"
        );
      }
    },
    listRewardHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const { search, status, categoryId, serviceId, owner, vendorId, startTime, endTime, page = 1, limit = 10 } = request.query as ListRewardQuery;

        const rewardRepo = fastify.db.getRepository(Reward);
        const rewardServiceTypeRepo = fastify.db.getRepository(RewardServiceType);

        const where: any = { isActive: true };

        if (status) where.status = status;
        if (categoryId) where.categoryId = categoryId;
        if (owner) where.owner = owner;
        if (owner === RewardOwner.VENDOR && vendorId) {
          where.vendorId = vendorId;
        }
        if (startTime && endTime) {
          const { utcStart, utcEnd } = getUtcRangeFromTwoIsoDates(startTime, endTime);
          where.startDate = MoreThanOrEqual(utcStart);
          where.endDate = LessThanOrEqual(utcEnd);
        } else if (startTime) {
          const { utcStart } = getDayBoundariesFromIso(startTime);
          where.startDate = MoreThanOrEqual(utcStart);
        } else if (endTime) {
          const { utcEnd } = getDayBoundariesFromIso(endTime);
          where.endDate = LessThanOrEqual(utcEnd);
        }
        let rewardIdsByService: number[] = [];

        if (serviceId) {
          const rows = await rewardServiceTypeRepo.find({
            where: { isActive: true, serviceId },
            select: ['rewardId'],
          });
          rewardIdsByService = rows.map((r: any) => r.rewardId);

          where.id = rewardIdsByService.length ? In(rewardIdsByService) : In([0]);
        }
        let finalWhere: any = where;

        if (search) {
          finalWhere = [
            { ...where, title: ILike(`%${search}%`) },
            { ...where, sideText: ILike(`%${search}%`) },
            { ...where, vendor: { name: ILike(`%${search}%`) } },
            { ...where, vendor: { vendorCode: ILike(`%${search}%`) } },
            { ...where, rewardCategory: { displayText: ILike(`%${search}%`) } },
          ];
        } else {
          finalWhere = where;
        }

        const [rewards, total] = await rewardRepo.findAndCount(
          {
            where: finalWhere,
            order: { id: "ASC" },
            skip: (page - 1) * limit,
            take: limit,
            relations: ["vendor", "rewardCategory"]
          }
        );

        const rewardsList = rewards.map(
          (reward: any) => ({
            id: reward.id,
            title: reward.title,
            category: {
              displayText: reward.rewardCategory?.displayText,
            },
            owner: reward.owner,
            vendor: {
              name: reward.vendor?.name,
            },
            startDate: reward.startDate,
            endDate: reward.endDate,
            status: reward.status,
          })
        );

        reply
          .status(200)
          .send(
            createPaginatedResponse(rewardsList, total, page, limit)
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message || "Failed to fetch rewards",
          (error as APIError).statusCode || 500,
          (error as APIError).code || "REWARDS_FETCH_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to fetch rewards"
        );
      }
    },
  }
}
