import Joi from 'joi';

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
    newRole: Joi.string().required(),
    email: Joi.string().email().optional(),
  })
};