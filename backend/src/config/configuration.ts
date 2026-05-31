import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().default(false),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_2FA_SECRET: Joi.string().min(32).required(),
  JWT_2FA_EXPIRES_IN: Joi.string().default('5m'),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().default(30),
  TOTP_ISSUER: Joi.string().default('Byup Fresh'),
});

export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNC === 'true',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    twoFaSecret: process.env.JWT_2FA_SECRET,
    twoFaExpiresIn: process.env.JWT_2FA_EXPIRES_IN || '5m',
  },
  refreshTokenTtlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS ?? '', 10) || 30,
  totpIssuer: process.env.TOTP_ISSUER || 'Byup Fresh',
});
