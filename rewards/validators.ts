import Joi from "joi";
import { RewardOfferType, RewardContributor, RewardOwner, RewardStatus, RewardMaxUsagePeriod } from "../utils/constant";

export const createRewardValidate = {
    body: Joi.object({
        owner: Joi.string().valid(RewardOwner.SHINR, RewardOwner.VENDOR).required().messages({
            "any.required": "Owner is required",
            "string.base": "Owner must be a string",
        }),

        vendorId: Joi.number()
            .when("owner", {
                is: RewardOwner.VENDOR,
                then: Joi.number().required().messages({
                    "any.required": "vendorId is required when owner is vendor",
                    "number.base": "vendorId must be a number",
                }),
                otherwise: Joi.number().forbidden(),
            }),

        title: Joi.string().required().messages({
            "any.required": "Title is required",
        }),

        sideText: Joi.string().required().messages({
            "any.required": "Side Text is required",
        }),

        summary: Joi.string().required().messages({
            "any.required": "Summary is required",
        }),

        description: Joi.string().required().messages({
            "any.required": "Description is required",
        }),

        rewardCategoryId: Joi.number().required().messages({
            "any.required": "Reward Category ID is required",
            "number.base": "Reward Category ID must be a number",
        }),

        serviceCategoryIds: Joi.array()
            .items(Joi.number())
            .required()
            .messages({
                "any.required": "Service Category IDs are required",
                "array.base": "Service Category IDs must be an array",
            }),

        displayCouponPage: Joi.boolean().required().messages({
            "any.required": "Display Coupon Page is required",
            "boolean.base": "Display Coupon Page must be a boolean",
        }),

        displayVendorPage: Joi.boolean().required().messages({
            "any.required": "Display Vendor Page is required",
            "boolean.base": "Display Vendor Page must be a boolean",
        }),

        offerType: Joi.string().valid(RewardOfferType.AMOUNT, RewardOfferType.CASHBACK, RewardOfferType.PERCENTAGE).required().messages({
            "any.required": "Offer Type is required",
        }),

        percentage: Joi.number()
            .when("offerType", {
                is: Joi.valid(RewardOfferType.CASHBACK, RewardOfferType.PERCENTAGE),
                then: Joi.number().required().messages({
                    "any.required": "Percentage is required when offerType is Cashback or Percentage",
                    "number.base": "Percentage must be a number",
                }),
                otherwise: Joi.forbidden(),
            }),

        maxDiscountAmount: Joi.number().required().messages({
            "any.required": "Max Discount Amount is required",
            "number.base": "Max Discount Amount must be a number",
        }),

        minOrderValue: Joi.number().required().messages({
            "any.required": "Min Order Value is required",
            "number.base": "Min Order Value must be a number",
        }),

        codeGeneration: Joi.string().required().messages({
            "any.required": "Code Generation is required",
        }),

        priority: Joi.number().required().messages({
            "any.required": "Priority is required",
            "number.base": "Priority must be a number",
        }),

        targetAudienceIds: Joi.array()
            .items(Joi.number())
            .required()
            .messages({
                "any.required": "Target Audience IDs are required",
                "array.base": "Target Audience IDs must be an array",
            }),

        startDate: Joi.date().iso().required().messages({
            "any.required": "Start Date is required",
            "date.base": "Start Date must be a valid date",
        }),

        endDate: Joi.date().iso().greater(Joi.ref("startDate")).optional().messages({
            "any.required": "End Date is required",
            "date.base": "End Date must be a valid date",
            "date.greater": "End Date must be greater than Start Date",
        }),

        totalGrabLimit: Joi.number().required().messages({
            "any.required": "Total Grab Limit is required",
            "number.base": "Total Grab Limit must be a number",
        }),

        contribution: Joi.string().valid(RewardContributor.PLATFORM, RewardContributor.SHARE, RewardContributor.VENDOR).required().messages({
            "any.required": "Contribution is required",
        }),

        shinrPercentage: Joi.number()
            .when("contribution", {
                is: RewardContributor.SHARE,
                then: Joi.number().required().messages({
                    "any.required": "SHINR Percentage is required when contribution is SHARE",
                    "number.base": "SHINR Percentage must be a number",
                }),
                otherwise: Joi.forbidden(),
            }),

        vendorPercentage: Joi.number()
            .when("contribution", {
                is: RewardContributor.SHARE,
                then: Joi.number().required().messages({
                    "any.required": "Vendor Percentage is required when contribution is SHARE",
                    "number.base": "Vendor Percentage must be a number",
                }),
                otherwise: Joi.forbidden(),
            }),

        maxUsage: Joi.number().required().messages({
            "any.required": "Max Usage is required",
            "number.base": "Max Usage must be a number",
        }),

        maxUsagePeriod: Joi.string().valid(RewardMaxUsagePeriod.DAY, RewardMaxUsagePeriod.HOUR, RewardMaxUsagePeriod.MONTH, RewardMaxUsagePeriod.OVERALL).required().messages({
            "any.required": "Max Usage Period is required",
        }),

        maxUsagePeriodValue: Joi.number()
            .when("maxUsagePeriod", {
                is: RewardMaxUsagePeriod.OVERALL,
                then: Joi.forbidden(),
                otherwise: Joi.number().required().messages({
                    "any.required": "Max Usage Period Value is required when maxUsagePeriod is not OVERALL",
                    "number.base": "Max Usage Period Value must be a number",
                })
            }),

        status: Joi.string().valid(RewardStatus.DRAFT, RewardStatus.ACTIVE).required().messages({
            "any.required": "Status is required",
        }),
    }),
};

export const updateRewardValidate = {
    body: Joi.object({
        rewardId: Joi.number().required().messages({
            "any.required": "Reward ID is required",
            "number.base": "Reward ID must be a number",
        }),
        owner: Joi.string().valid(RewardOwner.SHINR, RewardOwner.VENDOR).optional().messages({
            "string.base": "Owner must be a string",
        }),

        vendorId: Joi.number()
            .when("owner", {
                is: RewardOwner.VENDOR,
                then: Joi.number().required().messages({
                    "any.required": "vendorId is required when owner is vendor",
                    "number.base": "vendorId must be a number",
                }),
                otherwise: Joi.forbidden().messages({
                    "any.unknown": "vendorId is only allowed when owner is VENDOR",
                }),
            }),

        title: Joi.string().optional(),

        sideText: Joi.string().optional(),

        summary: Joi.string().optional(),

        description: Joi.string().optional(),

        rewardCategoryId: Joi.number().optional().messages({
            "number.base": "Reward Category ID must be a number",
        }),

        serviceCategoryIds: Joi.array()
            .items(Joi.number())
            .optional()
            .messages({
                "array.base": "Service Category IDs must be an array",
            }),

        displayCouponPage: Joi.boolean().optional().messages({
            "boolean.base": "Display Coupon Page must be a boolean",
        }),

        displayVendorPage: Joi.boolean().optional().messages({
            "boolean.base": "Display Vendor Page must be a boolean",
        }),

        offerType: Joi.string().valid(RewardOfferType.AMOUNT, RewardOfferType.CASHBACK, RewardOfferType.PERCENTAGE).optional().messages({
            "any.only": "Offer Type is invalid",
        }),

        percentage: Joi.when("offerType", {
            switch: [
                {
                    is: RewardOfferType.AMOUNT,
                    then: Joi.forbidden().messages({
                        "any.unknown": "Percentage is not allowed when offerType is AMOUNT",
                    }),
                },
                {
                    is: Joi.valid(RewardOfferType.CASHBACK, RewardOfferType.PERCENTAGE),
                    then: Joi.number().empty("").optional().messages({
                        "number.base": "Percentage must be a number",
                    }),
                },
            ],
            otherwise: Joi.number().empty("").optional().messages({
                "number.base": "Percentage must be a number",
            }),
        }),

        maxDiscountAmount: Joi.number().optional().messages({
            "number.base": "Max Discount Amount must be a number",
        }),

        minOrderValue: Joi.number().optional().messages({
            "number.base": "Min Order Value must be a number",
        }),

        codeGeneration: Joi.string().optional(),

        priority: Joi.number().optional().messages({
            "number.base": "Priority must be a number",
        }),

        targetAudienceIds: Joi.array()
            .items(Joi.number())
            .optional()
            .messages({
                "array.base": "Target Audience IDs must be an array",
            }),

        startDate: Joi.date().iso().optional().messages({
            "date.base": "Start Date must be a valid date",
        }),

        endDate: Joi.when("startDate", {
            is: Joi.exist(),
            then: Joi.date().iso().greater(Joi.ref("startDate")).messages({
                "date.base": "End Date must be a valid date",
                "date.greater": "End Date must be greater than Start Date",
            }),
            otherwise: Joi.date().iso().messages({
                "date.base": "End Date must be a valid date",
            }),
        }),
        totalGrabLimit: Joi.number().optional().messages({
            "number.base": "Total Grab Limit must be a number",
        }),

        contribution: Joi.string().valid(RewardContributor.PLATFORM, RewardContributor.SHARE, RewardContributor.VENDOR).optional().messages({
            "any.only": "Contribution is invalid",
        }),

        shinrPercentage: Joi.number()
            .when("contribution", {
                is: RewardContributor.SHARE,
                then: Joi.number().required().messages({
                    "any.required": "SHINR Percentage is required when contribution is SHARE",
                    "number.base": "SHINR Percentage must be a number",
                }),
                otherwise: Joi.forbidden().messages({
                    "any.unknown": "SHINR Percentage is only allowed when contribution is SHARE",
                }),
            }),

        vendorPercentage: Joi.number()
            .when("contribution", {
                is: RewardContributor.SHARE,
                then: Joi.number().required().messages({
                    "any.required": "Vendor Percentage is required when contribution is SHARE",
                    "number.base": "Vendor Percentage must be a number",
                }),
                otherwise: Joi.forbidden().messages({
                    "any.unknown": "Vendor Percentage is only allowed when contribution is SHARE",
                }),
            }),

        maxUsage: Joi.number().optional().messages({
            "number.base": "Max Usage must be a number",
        }),

        maxUsagePeriod: Joi.string().valid(RewardMaxUsagePeriod.DAY, RewardMaxUsagePeriod.HOUR, RewardMaxUsagePeriod.MONTH, RewardMaxUsagePeriod.OVERALL).optional().messages({
            "any.only": "Max Usage Period is invalid",
        }),

        maxUsagePeriodValue: Joi.when("maxUsagePeriod", {
            switch: [
                {
                    is: RewardMaxUsagePeriod.OVERALL,
                    then: Joi.forbidden().messages({
                        "any.unknown": "Max Usage Period Value is not allowed when maxUsagePeriod is OVERALL",
                    }),
                },
                {
                    is: Joi.valid(
                        RewardMaxUsagePeriod.HOUR,
                        RewardMaxUsagePeriod.DAY,
                        RewardMaxUsagePeriod.MONTH
                    ),
                    then: Joi.number().empty("").optional().messages({
                        "number.base": "Max Usage Period Value must be a number",
                    }),
                },
            ],
            otherwise: Joi.number().empty("").optional().messages({
                "number.base": "Max Usage Period Value must be a number",
            }),
        }),

        status: Joi.string().valid(RewardStatus.DRAFT, RewardStatus.ACTIVE).optional().messages({
            "any.only": "Status is invalid",
        }),
    }).min(2).messages({
        "object.min": "At least one field to update is required along with rewardId",
    }),
};
export const listRewardValidate = {
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
            .items(Joi.string().valid(...Object.values(RewardStatus)))
            .optional()
            .messages({
                'any.only': 'Status must be one of the allowed values',
                'array.base': 'Status must be an array of allowed values',
            }),

        owner: Joi.string()
            .valid(...Object.values(RewardOwner))
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

        serviceId: Joi.array()
            .items(Joi.number().integer())
            .optional()
            .messages({
                'number.base': 'Service ID must be a number',
                'number.integer': 'Service ID must be an integer',
                'array.base': 'Service IDs must be an array of integers',
            }),

        vendorId: Joi.array()
            .items(Joi.number().integer())
            .optional()
            .when('owner', {
                is: RewardOwner.VENDOR,
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
