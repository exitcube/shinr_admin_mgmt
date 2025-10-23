import Joi from 'joi';

export const carSearchValidate = {
  query: Joi.object({
    search: Joi.string()
      .pattern(/^[A-Za-z0-9\s]+$/) 
      .min(3)
      .optional()
      .messages({
        'string.pattern.base': 'Model search term can only contain letters, numbers, and spaces',
        'string.min': 'Model search term must be at least 3 characters long',
      }),

    makeId: Joi.number()
      .integer()
      .optional()
      .messages({
        'number.base': 'makeId must be a number',
      }),

    categoryId: Joi.number()
      .integer()
      .optional()
      .messages({
        'number.base': 'categoryId must be a number',
      }),

    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).optional().default(10),


    sortOrder: Joi.string().valid('ASC', 'DESC','asc','desc').optional().default('ASC'),
  }),

  body: Joi.object({}),
};
