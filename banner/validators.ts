import Joi from "joi";

export const createBannerValidate = {
  body: Joi.object({
    text: Joi.string().allow(null).empty('').optional(),
    bgColour: Joi.string().allow(null).empty('').optional(),
    bgImageId: Joi.string().uuid().allow(null).empty('').optional(),
    buttonText: Joi.string().required(),
    targetValue: Joi.string().required(),
  })
  .custom((value, helpers) => {
    
    const hasText = !!value.text;
    const hasColour = !!value.bgColour;
    const hasImage = !!value.bgImageId;

    if (hasText) {
      if (!hasColour) {
        return helpers.error("textRequiresColour");
      }
      if (hasImage) {
        return helpers.error("textBannerNoImage");
      }
    }
    if (hasImage) {
      return value;
    }
    if (!hasText && !hasImage) {
      return helpers.error("missingBannerType");
    }

    return value;
  })
  .messages({
    "textRequiresColour": "When using text banners, bgColour is required.",
    "textBannerNoImage": "bgImageId must not be provided when using text banners.",
    "missingBannerType": "You must provide either text+bgColour or bgImageId.",
  })
};
