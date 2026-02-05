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