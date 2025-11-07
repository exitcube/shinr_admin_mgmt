import Joi from 'joi';

export const addServicesValidator = {
    body: Joi.object({
        name: Joi.string().required().messages({
            'string.empty': 'Name is required',
            'string.pattern.base': 'Name must be a string',
        }),
        displayName: Joi.string().required().messages({
            'string.empty': 'Display Name is required',
            'string.pattern.base': 'Display Name must be a string',
        }),
        imageId: Joi.string().optional().messages({
            'string.pattern.base': 'Image ID must be a string',
        }),
        targetValue: Joi.string().required().messages({
            'string.empty': 'Target value is required',
            'string.pattern.base': 'Target value must be a string',
        }),
    }),
};

export const updateServicesValidator = {
   body: Joi.object({
        name: Joi.string().optional().messages({
            'string.pattern.base': 'Name must be a string',
        }),
        displayName: Joi.string().optional().messages({
            'string.pattern.base': 'Display Name must be a string',
        }),
        imageId: Joi.string().optional().messages({
            'string.pattern.base': 'Image ID must be a string',
        }),
        targetValue: Joi.string().optional().messages({
            'string.pattern.base': 'Target value must be a string',
        }),
    }),
};