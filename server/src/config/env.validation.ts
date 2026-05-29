export function validateEnv(config: Record<string, unknown>) {
  return {
    // extra config values
    ...config,
    // application port
    PORT: config.PORT ?? 3000,
    // database url
    DATABASE_URL:
      config.DATABASE_URL ??
      'mysql://cinemate:cinemate@localhost:3306/cinemate',
    // mysql connection pool size
    DATABASE_POOL_SIZE: config.DATABASE_POOL_SIZE ?? 10,
    // public backend base url used when generating file URLs
    APP_BASE_URL: config.APP_BASE_URL ?? 'http://localhost:3000',

    // s3-compatible object storage endpoint
    OBJECT_STORAGE_ENDPOINT:
      config.OBJECT_STORAGE_ENDPOINT ?? 'http://localhost:9000',
    // s3-compatible object storage region
    OBJECT_STORAGE_REGION: config.OBJECT_STORAGE_REGION ?? 'us-east-1',
    // object storage access key
    OBJECT_STORAGE_ACCESS_KEY:
      config.OBJECT_STORAGE_ACCESS_KEY ?? 'rustfsadmin',
    // object storage secret key
    OBJECT_STORAGE_SECRET_KEY:
      config.OBJECT_STORAGE_SECRET_KEY ?? 'rustfsadmin',
    // bucket used for uploaded app images
    OBJECT_STORAGE_BUCKET: config.OBJECT_STORAGE_BUCKET ?? 'cinemate-images',

    // enable idempotency protection for selected mutating endpoints
    IDEMPOTENCY_FLAG: config.IDEMPOTENCY_FLAG ?? 'false',
    // idempotency key retention in hours
    IDEMPOTENCY_TTL_HOURS: config.IDEMPOTENCY_TTL_HOURS ?? 24,

    // enable concise structured application request logs
    APP_LOGGING_FLAG: config.APP_LOGGING_FLAG ?? 'false',
    // log successful GET requests only when they exceed this duration
    APP_LOGGING_SLOW_MS: config.APP_LOGGING_SLOW_MS ?? 1000,

    // jwt access secret
    JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    // jwt refresh secret
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    // google OAuth client ID used to verify user Google ID tokens
    GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID ?? '',

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
