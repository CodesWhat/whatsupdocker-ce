import type Joi from 'joi';

export function getTokenAuthConfigurationSchema(joi: typeof Joi): Joi.AlternativesSchema {
  return joi.alternatives([
    joi.string().allow(''),
    joi.object().keys({
      login: joi.string(),
      password: joi.string(),
      token: joi.string(),
      auth: joi.string().base64(),
    }),
  ]);
}
