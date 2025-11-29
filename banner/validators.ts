import Joi from "joi";

export const createBannerValidate = {
  body: Joi.object({
    text: Joi.string().allow(null).empty('').optional(),
    bgColour: Joi.string().allow(null).empty('').optional(),
    bgImageId: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().pattern(/^\d+$/).allow(null).empty('')
    ).optional(),
    buttonText: Joi.string().required(),
    targetValue: Joi.string().required(),
    title: Joi.string().required(),
    category: Joi.string().allow(null).empty('').optional(),
    owner: Joi.string().allow(null).empty('').optional(),
    vendorId: Joi.string().allow(null).empty('').optional(),
    homePageView: Joi.boolean().optional(),
    displaySequence: Joi.number().optional(),
    startTime: Joi.string().isoDate().allow(null).empty('').optional(),
    endTime: Joi.string().isoDate().allow(null).empty('').optional(),
    buttonColour: Joi.string().allow(null).empty('').optional(),
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
export const updateBannerValidate = {
  body: Joi.object({
    text: Joi.string().trim().min(1).optional(),
    bgColour: Joi.string().trim().min(1).optional(),
    bgImageId: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().pattern(/^\d+$/).allow(null).empty('')
    ).optional(),
    buttonText: Joi.string().trim().optional(),
    targetValue: Joi.string().trim().optional()
  })
    .min(1)
    .custom((value, helpers) => {
      const hasText = !!value.text;
      const hasColour = !!value.bgColour;
      const hasImage = !!value.bgImageId;

      if ((hasText || hasColour) && hasImage) {
        return helpers.error("textBannerNoImage");
      }

      return value;
    })
    .messages({
      "object.min": "At least one field must be provided to update the banner.",
      "string.min": "Empty values are not allowed.",
      "textBannerNoImage": "You cannot provide bgImageId together with text or bgColour. Either only bgImageId or text and bgcolour together"
    })
};

export const approveBannerValidate = {
  body: Joi.object({
    status: Joi.string().valid('ACTIVE', 'DRAFT', 'EXPIRED').optional(),
  })
};

export const deleteBannerValidate = {
  params: Joi.object({
    id: Joi.string().pattern(/^\d+$/).required().messages({
      'string.pattern.base': 'id must be a valid positive integer'
    }),
  })
};

export const createBannerCategoryValidate = {
  body: Joi.object({
    value: Joi.string().required().trim().uppercase().pattern(/^[A-Z_]+$/).messages({
      'string.pattern.base': 'value must contain only uppercase letters and underscores',
      'any.required': 'value is required'
    }),
    displayValue: Joi.string().required().trim().min(1).messages({
      'any.required': 'displayValue is required',
      'string.min': 'displayValue cannot be empty'
    }),
  })
};

export const updateBannerCategoryValidate = {
  params: Joi.object({
    id: Joi.string().pattern(/^\d+$/).required().messages({
      'string.pattern.base': 'id must be a valid positive integer'
    }),
  }),
  body: Joi.object({
    value: Joi.string().trim().uppercase().pattern(/^[A-Z_]+$/).optional().messages({
      'string.pattern.base': 'value must contain only uppercase letters and underscores'
    }),
    displayValue: Joi.string().trim().min(1).optional().messages({
      'string.min': 'displayValue cannot be empty'
    }),
    isActive: Joi.boolean().optional(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided to update the banner category'
  })
};

export const deleteBannerCategoryValidate = {
  params: Joi.object({
    id: Joi.string().pattern(/^\d+$/).required().messages({
      'string.pattern.base': 'id must be a valid positive integer'
    }),
  })
};



