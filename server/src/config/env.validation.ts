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
  };
}
