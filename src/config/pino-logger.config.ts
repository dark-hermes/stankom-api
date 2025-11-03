export const pinoLoggerConfig = {
  pinoHttp:
    process.env.NODE_ENV !== 'production'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
            },
          },
        }
      : {},
};
