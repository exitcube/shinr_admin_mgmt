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
      .messages({
        'string.min': 'Search term must be at least 3 characters long',
        'string.base': 'Search must be a string',
      }),
  }),

  body: Joi.object({
    status: Joi.array()
      .items(
        Joi.string().valid(
          ...Object.values(BannerStatus).map(s => s.value)
        )
      )
      .optional()
      .messages({
        'any.only': 'Status must be one of the allowed values',
        'array.base': 'Status must be an array of allowed values',
      }),

    reviewStatus: Joi.array()
      .items(
        Joi.string().valid(
          ...Object.values(BannerReviewStatus).map(s => s.value)
        )
      )
      .optional()
      .messages({
        'any.only': 'Review status must be one of the allowed values',
        'array.base': 'Review status must be an array of allowed values',
      }),

    owner: Joi.string()
      .valid(...Object.values(BannerOwner))
      .optional()
      .messages({
        'any.only': 'Owner must be one of the allowed values',
        'string.base': 'Owner must be a string',
      }),

    categoryId: Joi.array()
      .items(Joi.number().integer())
      .optional()
      .messages({
        'number.base': 'Category ID must be a number',
        'number.integer': 'Category ID must be an integer',
        'array.base': 'Category IDs must be an array of integers',
      }),

    vendorId: Joi.array()
      .items(Joi.number().integer())
      .optional()
      .when('owner', {
        is: BannerOwner.VENDOR,
        then: Joi.optional(),
        otherwise: Joi.forbidden().messages({
          'any.unknown': 'Vendor ID is only allowed when owner is VENDOR',
        }),
      })
      .messages({
        'number.base': 'Vendor ID must be a number',
        'number.integer': 'Vendor ID must be an integer',
        'array.base': 'Vendor IDs must be an array of integers',
      }),

    startTime: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start time must be ISO-8601 datetime with timezone',
      }),

    endTime: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'End time must be ISO-8601 datetime with timezone',
      }),

    sortOrder: Joi.string()
      .uppercase()
      .valid('ASC', 'DESC')
      .optional()
      .default('ASC')
      .messages({
        'any.only': 'Sort order must be either ASC or DESC',
        'string.base': 'Sort order must be a string',
      }),

    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
      }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),
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

 startTime: Joi.date().iso().required(),
 endTime: Joi.date().iso().greater(Joi.ref("startTime")).optional(),

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
    .items(Joi.string().required())
    .min(1)
    .optional(),

  targetValue: Joi.string().optional(),

  priority: Joi.number().optional(),

  startTime: Joi.date().iso().optional(),
 endTime: Joi.date().iso().greater(Joi.ref("startTime")).optional(),

  homePageView: Joi.boolean().optional(),
}).messages({
   "any.required": "{{#label}} is required.",
  "any.only": "{{#label}} value is invalid.",
  "string.base": "{{#label}} must be a string.",
  "date.base": "{{#label}} must be a valid date.",
  "boolean.base": "{{#label}} must be a boolean.",
  "array.base": "targetAudienceId must be an array.",
});
