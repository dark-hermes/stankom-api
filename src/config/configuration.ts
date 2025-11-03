export default () => ({
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [],
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  cookie: {
    httpOnly: true,
    secret: process.env.COOKIE_SECRET,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
    // domain: process.env.COOKIE_DOMAIN ?? undefined,
  },
});
