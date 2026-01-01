import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions, } from "fastify";
import { APIError } from "../types/errors";
import { RewardUserTargetConfig } from "../models";
import { createSuccessResponse } from "../utils/response";
import { TargetAudience } from "../utils/constant";




export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
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
