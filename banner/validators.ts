import Joi from "joi";
import { BannerReviewStatus, BannerStatus ,BannerOwner, BANNER_APPROVAL_ACTIONS} from "../utils/constant";

 export const updateBannerCategoryValidate = {
  body: Joi.object({
    id: Joi.string()
      .required()
      .messages({
        "any.required": "Category_id is required",
      }),
    updatingText: Joi.string()
      .required()
      .messages({
        "any.required": "updating Text is required",
        "string.base": " must be a valid string",
      }),
  }),
};

export const listBannerValidate = {
  query: Joi.object({
    search: Joi.string()
      .min(3)
      .optional()
      .description(
        'Search by banner title, category display text, vendor name, or vendor code (minimum 3 characters)'
      ),

    reviewStatus: Joi.string()
      .valid(...Object.values(BannerReviewStatus).map(s => s.value))
      .optional()
      .description('Filter by banner review status'),

    status: Joi.string()
      .valid(...Object.values(BannerStatus).map(s => s.value))
      .optional()
      .description('Filter by banner status'),

    categoryId: Joi.number()
      .integer()
      .optional()
      .description('Filter by banner category ID'),

    vendorId: Joi.number()
      .integer()
      .optional()
      .description('Filter by vendor ID'),

    sortOrder: Joi.string()
      .uppercase()
      .valid('ASC', 'DESC')
      .optional()
      .default('ASC')
      .description('Sort order by display sequence'),

    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .description('Number of items per page'),
  }),
};


export const createBannerValidateSchema = Joi.object({
  title: Joi.string().required(),
  categoryId: Joi.string().required(),

  owner: Joi.string().valid(BannerOwner.SHINR, BannerOwner.VENDOR).required(),

  vendorId: Joi.when("owner", {
    is: BannerOwner.VENDOR,
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  targetAudienceId: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),

  targetValue: Joi.string().required(),

  priority: Joi.number().required(),

  startTime: Joi.date().required(),
  endTime: Joi.date().optional(),

  homePageView: Joi.boolean().required(),
}).messages({
  "any.required": "{{#label}} is required.",
  "any.only": "{{#label}} value is invalid.",
  "string.base": "{{#label}} must be a string.",
  "date.base": "{{#label}} must be a valid date.",
  "boolean.base": "{{#label}} must be a boolean.",
  "array.base": "targetAudienceId must be an array.",
});

export const approveBannerValidation = {
  body: Joi.object({
    bannerId:Joi.number().required().messages({
      "any.required": "bannerId is required.",
      "number.base": "bannerId must be a number."
    }),
    action: Joi.string()
      .valid(BANNER_APPROVAL_ACTIONS.APPROVE, BANNER_APPROVAL_ACTIONS.REJECT)
      .required()
      .messages({
        "any.required": "action is required.",
        "any.only": "action must be either 'approve' or 'reject'.",
        "string.base": "action must be a string."
      }),

    rejectReason: Joi.string().when("action", {
      is: "reject",
      then: Joi.string()
        .required()
        .messages({
          "any.required": "rejectReason is required when action is reject.",
          "string.base": "rejectReason must be a string."
        }),
      otherwise: Joi.forbidden().messages({
        "any.unknown": "rejectReason is allowed only when action is reject."
      })
    })
  })
};

export const updateBannerValidateSchema = Joi.object({
  bannerId: Joi.number().required(),
  title: Joi.string().optional(),
  categoryId: Joi.string().optional(),

  owner: Joi.string().valid(BannerOwner.SHINR, BannerOwner.VENDOR).optional(),

  vendorId: Joi.when("owner", {
    is: BannerOwner.VENDOR,
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  targetAudienceId: Joi.array()
    .items(Joi.string().optional())
    .min(1)
    .required(),

  targetValue: Joi.string().optional(),

  priority: Joi.number().optional(),

  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),

  homePageView: Joi.boolean().optional(),
}).messages({
   "any.required": "{{#label}} is required.",
  "any.only": "{{#label}} value is invalid.",
  "string.base": "{{#label}} must be a string.",
  "date.base": "{{#label}} must be a valid date.",
  "boolean.base": "{{#label}} must be a boolean.",
  "array.base": "targetAudienceId must be an array.",
});
