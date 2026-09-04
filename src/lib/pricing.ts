/**
 * Temps de livraison estimé (minutes) à partir de la distance :
 * vitesse moyenne ~18 km/h en ville + ~12 min de préparation.
 */
export function estimateDeliveryTime(distanceKm: number): number {
  return Math.max(15, Math.round((distanceKm / 18) * 60) + 12);
}
