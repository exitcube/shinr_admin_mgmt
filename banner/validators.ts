import Joi from "joi";

import { BannerOwner } from "../utils/constant";
import { BannerTargetAudience } from "../utils/constant";
import { BannerCategory } from "../utils/constant";
import { BannerAudienceSelection } from "../utils/constant";

export const createBannerValidateSchema = Joi.object({
    title:Joi.string().required().messages({'string.empty': 'Title is required',}),
    text: Joi.string().allow(null).empty('').optional(),
    bgColour: Joi.string().allow(null).empty('').optional(),

    bgImageId: Joi.string().uuid().allow(null).empty('').optional(),

    buttonText: Joi.string().required(),
    buttonColour: Joi.string().required(),

    category:Joi.string().valid(BannerCategory.FESTIVAL,BannerCategory.COME_BACK_USER,BannerCategory.MIN_CARWASH).optional(),

    owner: Joi.string().valid(BannerOwner.SHINR,BannerOwner.VENDOR).required(),

    homePageView: Joi.boolean().optional(),

    displaySequence: Joi.number().integer().min(1).max(10000).required(),

    targetAudience: Joi.string().valid(BannerTargetAudience.EVERYONE,BannerTargetAudience.MANUAL,BannerTargetAudience.SPECIALRULES).required(),
    targetValue: Joi.string().optional().allow(null),

    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref("startTime")).required(),

    audienceSelection:Joi.string().valid(BannerAudienceSelection.FIRST_CAR_WASH,BannerAudienceSelection.FIRST_ANY_SERVICE,BannerAudienceSelection.NEW_USER).optional(),

    vendorId: Joi.string().allow(null).empty('').when("owner", {
      is: "vendor",
      then: Joi.string().uuid().required(),
      otherwise: Joi.optional()
    }),
  })
  .custom((value, helpers) => {
    const hasText = !!value.text;
    const hasColour = !!value.bgColour;
    const hasImage = !!value.bgImageId;

    // 🟦 Rule 1: If text → bgColour required
    if (hasText) {
      if (!hasColour) {
        return helpers.error("textRequiresColour");
      }
      if (hasImage) {
        return helpers.error("textBannerNoImage");
      }
    }

    // 🟩 Rule 2: If image → no text required (no conflict)
    if (hasImage) {
      return value;
    }

    // 🟥 Rule 3: Neither text nor image → invalid
    if (!hasText && !hasImage) {
      return helpers.error("missingBannerType");
    }

    return value;
  })
  .messages({
    // custom messages
    "textRequiresColour": "When using text banners, bgColour is required.",
    "textBannerNoImage": "bgImageId must not be provided when using text banners.",
    "missingBannerType": "You must provide either text+bgColour or bgImageId.",

    // vendor rule message
    "string.uuid": "Invalid UUID format for vendorId or bgImageId.",
    "any.required": "Missing required field.",
  });

 



