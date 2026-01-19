import Joi from 'joi';

export const carSearchValidate = {
  query: Joi.object({
    search: Joi.string()
      .pattern(/^[A-Za-z0-9\s]+$/) 
      .optional()
      .messages({
        'string.pattern.base': 'Model search term can only contain letters, numbers, and spaces',
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

export const addVehicleBrandValidate = {
  body: Joi.object({
    name: Joi.string().required(),
  }),
};

export const updateVehicleBrandValidate = {
  body: Joi.object({
    vehicleTypeId: Joi.number().integer().required(),
    name: Joi.string().required(),
  }),
};

export const addVehicleValidate = {
  body: Joi.object({
    model: Joi.string().required(),
    makeId: Joi.number().integer().required(),
    categoryId: Joi.number().integer().required(),
  }),
};
export const editVehicleValidate = {
  body: Joi.object({
    model: Joi.string().optional(),
    makeId: Joi.number().integer().optional(),
    categoryId: Joi.number().integer().optional(),
  }),
};

export const vehicleModelsListingValidate = {
  body: Joi.object({
    searchBrandId: Joi.array().items(Joi.number()).optional(),
    searchVehicleTypeId: Joi.array().items(Joi.number()).optional(),
  }),
};
