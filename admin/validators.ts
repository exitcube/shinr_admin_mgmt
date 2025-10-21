import Joi from 'joi';

export const carSearchValidate = {
  query: Joi.object({
    searchByModel: Joi.string()
      .min(3)
      .optional()
      .messages({
        'string.min': 'Model search term must be at least 3 characters long',
      }),

    make: Joi.string()
      .min(3)
      .optional()
      .messages({
        'string.min': 'Make search term must be at least 3 characters long',
      }),

    makeId: Joi.number()
      .integer()
      .optional()
      .messages({
        'number.base': 'makeId must be a number',
      }),

    category: Joi.string()
      .min(3)
      .optional()
      .messages({
        'string.min': 'Category search term must be at least 3 characters long',
      }),

    categoryId: Joi.number()
      .integer()
      .optional()
      .messages({
        'number.base': 'categoryId must be a number',
      }),

    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).optional().default(10),


    sortOrder: Joi.string().valid('ASC', 'DESC').optional().default('ASC'),
  }),

  body: Joi.object({}),
};
