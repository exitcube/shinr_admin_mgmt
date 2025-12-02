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

export const listBannerValidate = {
  query: Joi.object({
    search: Joi.string()
      .min(3)
      .optional()
      .description(
        'Search by banner title, category display text, vendor name, or vendor code (minimum 3 characters)'
      ),

    reviewStatus: Joi.string()
      .valid('APPROVED', 'REJECTED', 'PENDING')
      .optional()
      .description('Filter by banner review status'),

    status: Joi.string()
      .valid('ACTIVE', 'DRAFT', 'EXPIRED') 
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
      .valid('ASC', 'DESC', 'asc', 'desc')
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
