import Joi from "joi";

import { BannerCategory } from "../utils/constant";
import { BannerStatus } from "../utils/constant";
import { BannerReviewStatus } from "../utils/constant";

export const bannerFilterValidate = {
  query: Joi.object({
    searchByCategory: Joi.string()
      .valid(
        BannerCategory.FESTIVAL,
        BannerCategory.COME_BACK_USER,
        BannerCategory.MIN_CARWASH
      )
      .optional()
      .messages({
        "string.pattern.base":
          "category search term can only contaim FESTIVAL,COME_BACK_USER,MIN_CAR_WASH",
      }),

    vendorId: Joi.number().integer().optional().messages({
      "number.base": "vendorId must be a number",
    }),

    status: Joi.string()
      .valid(BannerStatus.ACTIVE, BannerStatus.DRAFT, BannerStatus.EXPIRED)
      .optional()
      .messages({
        "string.pattern.base": "status should be ACTIVE ,DRAFT,EXPIRED",
      }),

    reviewStatus: Joi.string()
      .valid(
        BannerReviewStatus.APPROVED,
        BannerReviewStatus.PENDING,
        BannerReviewStatus.REJECTED
      )
      .optional()
      .messages({
        "string.pattern.base":
          "ReviewStatus should be APPROVED ,PENDING,REJECTED",
      }),
    startTime: Joi.date().iso().optional().messages({
      "date.base": "Start time must be a valid date",
      "date.format": "Start time must be in ISO format",
      "any.required": "Start time is required",
    }),
    endTime: Joi.date()
      .iso()
      .optional()
      .messages({
        "date.base": "End time must be a valid date",
        "date.format": "End time must be in ISO format",
        "date.greater": "End time must be greater than Start time",
        "any.required": "End time is required",
      }),

    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).optional().default(10),

    sortOrder: Joi.string()
      .valid("ASC", "DESC", "asc", "desc")
      .optional()
      .default("ASC"),
  }),
};
