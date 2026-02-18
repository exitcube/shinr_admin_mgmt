import Joi from 'joi';
import { ServiceStatus } from '../utils/constant';

export const createServiceValidateSchema = Joi.object({
    name: Joi.string().trim().max(100).required(),
    displayName: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().optional().allow(null, ""),
    displaySequence: Joi.number().integer().min(1).optional(),
});

export const updateServiceValidateSchema = Joi.object({

    serviceId: Joi.number().required(),
    displayName: Joi.string().trim().max(100).optional(),
    description: Joi.string().trim().optional().allow(null, ""),
    displaySequence: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid(ServiceStatus.DRAFT.value, ServiceStatus.ACTIVE.value).optional().messages({
        "any.only": "Status is invalid",
    }),

  });

  export const listServiceValidate = {
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
          ...Object.values(ServiceStatus).map(s => s.value)
        )
      )
      .optional()
      .messages({
        'any.only': 'Status must be one of the allowed values',
        'array.base': 'Status must be an array of allowed values',
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
