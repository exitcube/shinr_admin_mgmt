import Joi from "joi";

export const createBannerValidate = {
  body: Joi.object({
    text: Joi.string().allow(null).empty('').optional(),
    bgImageId: Joi.string().uuid().allow(null).empty('').optional(),
    buttonText: Joi.string().required(),
    targetValue: Joi.string().required(),
  })
  .or('text', 'bgImageId')
  .messages({
    'object.missing': 'Either text or bgImageId must be provided for the banner.'
  })
};
