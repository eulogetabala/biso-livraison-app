/**
 * Frais de livraison en FCFA selon la distance (en km) :
 * - 0 à 5 km   → 1 000 FCFA
 * - 6 à 10 km  → 1 500 FCFA
 * - au-delà    → 2 000 FCFA
 */
export function computeDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 5) return 1000;
  if (distanceKm <= 10) return 1500;
  return 2000;
}

/** Distances simulées (km) des restaurants mock par rapport à l'utilisateur. */
const MOCK_RESTAURANT_DISTANCES: Record<string, number> = {
  'rest-1': 1.2,
  'rest-2': 2.4,
  'rest-3': 3.8,
  'rest-4': 4.3,
  'rest-5': 5.1,
};

export function mockRestaurantDistanceKm(restaurantId: string): number {
  return MOCK_RESTAURANT_DISTANCES[restaurantId] ?? 1.8;
}
