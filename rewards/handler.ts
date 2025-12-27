import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { Reward,RewardCategory,RewardAudienceType,RewardContribution,RewardServiceType,RewardUserTargetConfig,RewardUserTarget,Service, RewardOfferType } from "../models/index";
import { APIError } from "../types/errors";
import { CreateRewardBody } from "./type";
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
          startDate,
          endDate,
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
        });

        await rewardOfferTypeRepo.save(newOfferType);


        const newContribution = rewardContributorRepo.create({
          contributor: contribution,
          shinrPercentage: shinrPercentage ?? null,
          vendorPercentage: vendorPercentage ?? null
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
    }
  }
}
