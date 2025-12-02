import Joi from "joi";

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

