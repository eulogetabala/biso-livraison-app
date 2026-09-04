/** UUIDs partagés avec le seed Prisma (`delivery-backend/prisma/seed-data.ts`). */
export const SEED_IDS = {
  restaurants: {
    nganda: 'f0000001-0000-4000-8000-000000000001',
    pizza: 'f0000001-0000-4000-8000-000000000002',
    green: 'f0000001-0000-4000-8000-000000000003',
    market: 'f0000001-0000-4000-8000-000000000004',
  },
} as const;

export const MARKET_RESTAURANT_ID = SEED_IDS.restaurants.market;
export const MARKET_RESTAURANT_NAME = 'Biso Market';
