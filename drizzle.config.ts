import { defineConfig } from 'drizzle-kit';

// Fallback to `NUXT_DATABASE_URL` if `DATABASE_URL` is not set.
const databaseUrl = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL or NUXT_DATABASE_URL environment variable is required.'
  );
}

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  schema: './server/database/schemas/index.ts',
  out: './.drizzle/migrations',
});
