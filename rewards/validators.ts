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

        title: Joi.string().optional().messages({
            "any.required": "Title is required",
        }),

        sideText: Joi.string().optional().messages({
            "any.required": "Side Text is required",
        }),

        summary: Joi.string().optional().messages({
            "any.required": "Summary is required",
        }),

        description: Joi.string().optional().messages({
            "any.required": "Description is required",
        }),

        rewardCategoryId: Joi.number().optional().messages({
            "any.required": "Reward Category ID is required",
            "number.base": "Reward Category ID must be a number",
        }),

        serviceCategoryIds: Joi.array()
            .items(Joi.number())
            .optional()
            .messages({
                "any.required": "Service Category IDs are required",
                "array.base": "Service Category IDs must be an array",
            }),

        displayCouponPage: Joi.boolean().optional().messages({
            "any.required": "Display Coupon Page is required",
            "boolean.base": "Display Coupon Page must be a boolean",
        }),

        displayVendorPage: Joi.boolean().optional().messages({
            "any.required": "Display Vendor Page is required",
            "boolean.base": "Display Vendor Page must be a boolean",
        }),

        offerType: Joi.string().valid(RewardOfferType.AMOUNT, RewardOfferType.CASHBACK, RewardOfferType.PERCENTAGE).optional().messages({
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

        maxDiscountAmount: Joi.number().optional().messages({
            "any.required": "Max Discount Amount is required",
            "number.base": "Max Discount Amount must be a number",
        }),

        minOrderValue: Joi.number().optional().messages({
            "any.required": "Min Order Value is required",
            "number.base": "Min Order Value must be a number",
        }),

        codeGeneration: Joi.string().optional().messages({
            "any.required": "Code Generation is required",
        }),

        priority: Joi.number().optional().messages({
            "any.required": "Priority is required",
            "number.base": "Priority must be a number",
        }),

        targetAudienceIds: Joi.array()
            .items(Joi.number())
            .optional()
            .messages({
                "any.required": "Target Audience IDs are required",
                "array.base": "Target Audience IDs must be an array",
            }),

        startDate: Joi.date().iso().optional().messages({
            "any.required": "Start Date is required",
            "date.base": "Start Date must be a valid date",
        }),

        endDate: Joi.date().iso().greater(Joi.ref("startDate")).optional().messages({
            "any.required": "End Date is required",
            "date.base": "End Date must be a valid date",
            "date.greater": "End Date must be greater than Start Date",
        }),
        totalGrabLimit: Joi.number().optional().messages({
            "any.required": "Total Grab Limit is required",
            "number.base": "Total Grab Limit must be a number",
        }),

        contribution: Joi.string().valid(RewardContributor.PLATFORM, RewardContributor.SHARE, RewardContributor.VENDOR).optional().messages({
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

        maxUsage: Joi.number().optional().messages({
            "any.required": "Max Usage is required",
            "number.base": "Max Usage must be a number",
        }),

        maxUsagePeriod: Joi.string().valid(RewardMaxUsagePeriod.DAY, RewardMaxUsagePeriod.HOUR, RewardMaxUsagePeriod.MONTH, RewardMaxUsagePeriod.OVERALL).optional().messages({
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

        status: Joi.string().valid(RewardStatus.DRAFT, RewardStatus.ACTIVE).optional().messages({
            "any.required": "Status is required",
        }),
    }),
};
