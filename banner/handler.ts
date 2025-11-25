import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Banner,BannerAudienceType,BannerUserTarget,BannerUserTargetConfig } from '../models/index';
import { createBannerBody } from './type';
import { createSuccessResponse } from '../utils/response';
import { APIError } from '../types/errors';
import { createBannerValidateSchema } from './validators';
import { BannerTargetAudience } from '../utils/constant';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions):any {
    return {

        createbannerhandler: async (request: FastifyRequest<{ Body: createBannerBody }>,reply: FastifyReply): Promise<void> => {
            try {


               const bannerRepo = fastify.db.getRepository(Banner);
                const bannerUserTargetConfigRepo=fastify.db.getRepository(BannerUserTargetConfig);
               const bannerAudienceTypeRepo=fastify.db.getRepository(BannerAudienceType);
               const bannerUserTargetRepo=fastify.db.getRepository(BannerUserTarget);
              

                const { title ,text, bgColour, bgImageId, buttonText,
                       buttonColour,category,vendorId,owner,homePageView,
                       displaySequence,targetAudience,targetValue,endTime,startTime,audienceSelection
                       } = request.body;
                 
                const isImage = bgImageId ? true : false;

                 
                const newBanner = bannerRepo.create({
                    title,
                    text,
                    bgColour,
                    isImage,
                    bgImageId,
                    buttonText,
                    buttonColour,
                    category,
                    vendorId,
                    owner,
                    homePageView,
                    displaySequence,
                    startTime,
                    endTime,
                    targetValue,
                });
                await bannerRepo.save(newBanner);

            const newBannerUserTargetConfig=bannerUserTargetConfigRepo.create({
              value:audienceSelection,
              category:targetAudience
            });
            await bannerUserTargetConfigRepo.save(newBannerUserTargetConfig);

            const newBannerAudienceType=bannerAudienceTypeRepo.create({
              bannerId:newBanner.id,
              bannerConfigId:newBannerUserTargetConfig.id,
            });
            await bannerAudienceTypeRepo.save(newBannerAudienceType);

                 if(targetAudience==BannerTargetAudience.MANUAL)
                 {

                 }
                 else if(targetAudience==BannerTargetAudience.SPECIALRULES)
                 {

                 }
                 else if(targetAudience==BannerTargetAudience.EVERYONE)
                 {
                  
                 }
                reply.status(201).send(
                    createSuccessResponse("Banner created successfully")
                );
            }
            catch (error) {
                throw new APIError(
                    (error as Error).message || 'Failed to create banner',
                    500,
                    "BANNER_CREATION_FAILED",
                    true,
                    "Failed to create banner. Please try again later."
                );
            }
        },


    }
}