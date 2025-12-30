import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { Reward,RewardCategory,RewardAudienceType,RewardContribution,RewardServiceType,RewardUserTargetConfig,RewardUserTarget,Service, RewardOfferType } from "../models/index";
import { APIError } from "../types/errors";
import { CreateRewardBody,UpdateRewardBody } from "./type";
import { createSuccessResponse } from "../utils/response";



export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
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
          for (const id of serviceCategoryIds) {
            const service = await serviceRepo.findOne({ where: { id, isActive: true } });
            if (!service) {
              throw new APIError(
                "service not found",
                400,
                "TARGET_SERVICE_INVALID",
                false,
                "the given service is  is not available"
              );
            }
            const newRewardServiceType = rewardServiceTypeRepo.create({
              rewardId: newReward.id,
              serviceId: service.id ,
              isActive:true,
            })

            await rewardServiceTypeRepo.save(newRewardServiceType);
          }
        }
        if (targetAudienceIds && Array.isArray(targetAudienceIds)) {
          for (const id of targetAudienceIds) {
            const targetAudience = await rewardUserTargetConfigRepo.findOne({
              where: { id: id, isActive: true },
            });
            if (!targetAudience) {
              throw new APIError(
                "Target audience not found",
                400,
                "TARGET_AUDIENCE_INVALID",
                false,
                "the given targetAudience is  is not found"
              );
            }
            const newRewardAudience = rewardAudienceTypeRepo.create({
              rewardId: newReward.id,
              rewardConfigId: id,
              isActive: true,
            });
            await rewardAudienceTypeRepo.save(newRewardAudience);

          }
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
          for (const id of serviceCategoryIds) {
            const service = await serviceRepo.findOne({ where: { id, isActive: true } });
            if (!service) {
              throw new APIError(
                "service not found",
                400,
                "TARGET_SERVICE_INVALID",
                false,
                "the given service is  is not available"
              );
            }
            const newRewardServiceType = rewardServiceTypeRepo.create({
              rewardId: rewardId,
              serviceId: service.id,
              isActive:true,
            })
            await rewardServiceTypeRepo.save(newRewardServiceType);
          }

        }

        if (targetAudienceIds && Array.isArray(targetAudienceIds)) {
          const existingRewardAudienceTypes = await rewardAudienceTypeRepo.update({ rewardId: rewardId }, { isActive: false });
          for (const id of targetAudienceIds) {
            const targetAudience = await rewardUserTargetConfigRepo.findOne({ where: { id, isActive: true } });
            if (!targetAudience) {
              throw new APIError(
                "Target audience not found",
                400,
                "TARGET_AUDIENCE_INVALID",
                false,
                "the given targetAudience is  is not found"
              );
            }
            const newRewardAudience = rewardAudienceTypeRepo.create({
              rewardId: rewardId,
              rewardConfigId: id,
              isActive: true,
            });
            await rewardAudienceTypeRepo.save(newRewardAudience);
          }

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
  }
}
