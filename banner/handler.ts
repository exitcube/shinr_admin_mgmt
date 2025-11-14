import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Banner } from '../models/index';
import { CreateBannerBody, UpdateBannerBody } from './type';
import { createSuccessResponse } from '../utils/response';
import { APIError } from '../types/errors';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions):any {
    return {

        createbannerhandler: async (
            request: FastifyRequest<{ Body: CreateBannerBody }>,
            reply: FastifyReply
        ): Promise<void> => {
            try {
                const { text, bgColour, bgImageId, buttonText, targetValue } = request.body;


                const bannerRepo = fastify.db.getRepository(Banner);

                const isImage = bgImageId ? true : false;

                const newBanner = bannerRepo.create({
                    text,
                    bgColour,
                    bgImageId,
                    buttonText,
                    targetValue,
                    isImage,
                    isActive: true
                });

                await bannerRepo.save(newBanner);

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

        updatebannerhandler: async (
          request: FastifyRequest<{ Body: UpdateBannerBody }>,
          reply: FastifyReply
        ): Promise<void> => {
          try {
            const { id } = request.query as any;
            const { text, bgColour, bgImageId, buttonText, targetValue } = request.body;
        
            const bannerRepo = fastify.db.getRepository(Banner);
        
            const existingbanner = await bannerRepo.findOne({
              where: { id, isActive: true }
            });
        
            if (!existingbanner) {
              throw new APIError(
                `Banner with id ${id} not found`,
                404,
                "BANNER_NOT_FOUND",
                true,
                "The banner you are trying to update does not exist."
              );
            }
            const updateData: any = {
              text: text ?? existingbanner.text,
              bgColour: bgColour ?? existingbanner.bgColour,
              bgImageId: bgImageId ?? existingbanner.bgImageId,
              buttonText: buttonText ?? existingbanner.buttonText,
              targetValue: targetValue ?? existingbanner.targetValue,
              isImage: existingbanner.isImage
            };
            if (bgImageId) {
              updateData.isImage = true;
              updateData.text = null;
              updateData.bgColour = null;
            }
            else if (text && bgColour && !bgImageId) {
              updateData.isImage = false;
              updateData.bgImageId = null;
            }
        
            await bannerRepo.update({ id }, updateData);
        
            reply.status(200).send(
              createSuccessResponse("Banner updated successfully")
            );
          }
          catch (error) {
            throw new APIError(
              (error as Error).message || 'Failed to update banner',
              500,
              "BANNER_UPDATE_FAILED",
              true,
              "Failed to update banner. Please try again later."
            );
          }
        }
        ,

        deletebannerhandler: async (
            request: FastifyRequest,
            reply: FastifyReply
          ): Promise<void> => {
            try {
              const { id } = request.query as any;

              const bannerRepo = fastify.db.getRepository(Banner);
          
              const existingbanner = await bannerRepo.findOne({ where: { id, isActive: true } });
          
              if (!existingbanner) {
                throw new APIError(
                  `Banner not found`,
                  404,
                  "BANNER_NOT_FOUND",
                  true,
                  "The banner you are trying to delete does not exist."
                );
              }
              await bannerRepo.update({ id }, { isActive: false });
          
              reply.status(200).send(
                createSuccessResponse("Banner deleted successfully")
              );
            }
            catch (error) {
              throw new APIError(
                (error as Error).message || 'Failed to delete banner',
                500,
                "BANNER_DELETE_FAILED",
                true,
                "Failed to delete banner. Please try again later."
              );
            }
          }

    }
}