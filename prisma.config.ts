import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env at the project root so Prisma's
// `env()` helper (used below) can find DATABASE_URL when the Prisma CLI
// loads this config file.
dotenvConfig({ path: '.env' });

import { defineConfig, env } from 'prisma/config';

if (!process.env.DATABASE_URL) {
  // Friendly runtime message to help users diagnose missing env var.
  // Prisma's `env()` will still throw if nothing is found; this just improves
  // the developer experience when running locally.
  console.warn(
    'Warning: DATABASE_URL not found in environment. Ensure you have a .env file at the project root with DATABASE_URL set, or set the environment variable directly.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
