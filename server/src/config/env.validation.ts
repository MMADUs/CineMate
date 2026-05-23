export function validateEnv(config: Record<string, unknown>) {
  return {
    // extra config values
    ...config,
    // application port
    PORT: config.PORT ?? 3000,
    // database url
    DATABASE_URL: config.DATABASE_URL ?? './data/cinemate.db',
    // jwt access secret
    JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    // jwt refresh secret
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    // admin jwt access secret
    JWT_ADMIN_ACCESS_SECRET:
      config.JWT_ADMIN_ACCESS_SECRET ?? 'dev-admin-access-secret',
    // admin jwt refresh secret
    JWT_ADMIN_REFRESH_SECRET:
      config.JWT_ADMIN_REFRESH_SECRET ?? 'dev-admin-refresh-secret',
    // xendit secret api key
    XENDIT_API_KEY: config.XENDIT_API_KEY ?? '',
    // xendit webhook callback verification token
    XENDIT_CALLBACK_TOKEN: config.XENDIT_CALLBACK_TOKEN ?? '',
    // xendit invoice lifetime in seconds
    XENDIT_INVOICE_DURATION_SECONDS:
      config.XENDIT_INVOICE_DURATION_SECONDS ?? 24 * 60 * 60,
    // frontend redirect url after successful hosted checkout
    FRONTEND_SUCCESS_URL:
      config.FRONTEND_SUCCESS_URL ?? 'http://localhost:3000/payment/success',
    // frontend redirect url after failed hosted checkout
    FRONTEND_FAILURE_URL:
      config.FRONTEND_FAILURE_URL ?? 'http://localhost:3000/payment/failed',
  };
}
