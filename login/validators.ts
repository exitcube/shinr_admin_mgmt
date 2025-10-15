import Joi from 'joi';

export const loginValidate = {
    body: Joi.object({
        mobile: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                'string.empty': 'Mobile number is required',
                'string.pattern.base': 'Mobile number must be 10 digits',
            }),
    }),
    query: Joi.object({}), // empty object schema for query
};
export const verifyOtpValidate = {
    body: Joi.object({
        otpToken: Joi.string()
            .required()
            .messages({
                'string.empty': 'otp token is required',
            }),
        otp: Joi.string()
            .pattern(/^\d{4}$/) // 4-digit number as string
            .required()
            .messages({
                'string.empty': 'OTP is required',
                'string.pattern.base': 'OTP must be a 4-digit number',
            }),
    }),
    query: Joi.object({}), // empty object schema for query
};
export const verifyOtpTokenValidate = {
    body: Joi.object({
        otpToken: Joi.string()
            .required()
            .messages({
                'string.empty': 'OTP token is required',
            }),
    }),
    query: Joi.object({}), // empty object schema for query
};

export const refreshTokenValidate = {
    body: Joi.object({
        refreshToken: Joi.string()
            .required()
            .messages({
                'string.empty': 'Refresh token is required',
            }),
    }),
    query: Joi.object({}),
};

