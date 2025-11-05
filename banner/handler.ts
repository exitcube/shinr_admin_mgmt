import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginOptions } from 'fastify';
import { Banner } from '../models/index';
import { CreateBannerBody } from './type';
import { createSuccessResponse } from '../utils/response';
import { APIError } from '../types/errors';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions):any {
    return {

        createbannerhandler: async (
            request: FastifyRequest<{ Body: CreateBannerBody }>,
            reply: FastifyReply
        ): Promise<void> => {
            try {
                const { text, bgImageId, buttonText, targetValue } = request.body;

                const bannerRepo = fastify.db.getRepository(Banner);

                const isImage = bgImageId ? true : false;

                const newBanner = bannerRepo.create({
                    text,
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
        }
    }
}
