import Joi from 'joi';
import { ADMIN_ALLOWED_ROLES } from '../utils/constant';

export const adminLoginValidate = {
  body: Joi.object({
    userName: Joi.string()
      .required()
      .messages({
        "string.empty": "Username is required",
        "any.required": "Username is required",
      }),

    password: Joi.string()
      .required()
      .messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
  }),
};

export const createAdminUserValidate = {
  body: Joi.object({
    userName: Joi.string().min(3).required(),
    newRole: Joi.string()
    .required()
    .valid(...ADMIN_ALLOWED_ROLES.map(role => Object.values(role)[0].value)),
    email: Joi.string().email().required(),
    joiningDate: Joi.date().iso().required()
  })
};

export const editAdminUserValidate = {
  body: Joi.object({
    userName: Joi.string().min(3).optional(),
    newRole: Joi.string()
    .optional()
    .valid(...ADMIN_ALLOWED_ROLES.map(role => Object.values(role)[0].value)),
    email: Joi.string().email().optional(),
    joiningDate: Joi.date().iso().optional()
  })
};
export const adminUserListingValidate = {
  query: Joi.object({
    search: Joi.string().trim().min(3).optional().messages({
      "string.min": "Search term must be at least 3 characters long",
      "string.base": "Search must be a string",
    }),
  }),

  body: Joi.object({
    role: Joi.array()
      .items(Joi.string().valid(...ADMIN_ALLOWED_ROLES.map(role => Object.values(role)[0].value)))
      .min(1)
      .optional()
      .messages({
        "array.base": "Role must be an array of valid roles",
        "any.only": "Role contains invalid value",
      }),

    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),

    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
  }),
};