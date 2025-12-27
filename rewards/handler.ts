import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { APIError } from "../types/errors";
import { createSuccessResponse } from "../utils/response";
import { Reward, RewardAudienceType, RewardUserTargetConfig } from "../models";





export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
    singleRewardHandler: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
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
  }
}
