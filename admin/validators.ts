import Joi from 'joi';

export const carSearchValidate = {
  query: Joi.object({
    model: Joi.string()
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
    category: Joi.string()
      .min(3)
      .optional()
      .messages({
        'string.min': 'Category search term must be at least 3 characters long',
      }),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).optional().default(10),
    sortBy: Joi.string()
      .valid('model', 'make', 'category')
      .optional()
      .default('model'),
    sortOrder: Joi.string().valid('ASC', 'DESC').optional().default('ASC'),
  }),
  body: Joi.object({}),
};
