import { drizzle } from 'drizzle-orm/node-postgres';

import { schemas } from '~~/server/database';

export function useDrizzle() {
  const { databaseURL } = useRuntimeConfig();
  if (!databaseURL) {
    throw new Error('Database URL is not defined in runtime config.');
  }

  return drizzle(databaseURL, {
    schema: { ...schemas },
  });
}
