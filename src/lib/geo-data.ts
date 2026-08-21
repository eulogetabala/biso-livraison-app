/**
 * Base locale de quartiers / arrondissements de Brazzaville et Pointe-Noire.
 * Utilisée pour la recherche d'adresse : le géocodage du système ne couvre
 * pas toujours bien les quartiers congolais, on donne donc une liste fiable
 * avec des coordonnées approximatives.
 */

export type GeoPlace = {
  name: string;
  city: 'Brazzaville' | 'Pointe-Noire';
  latitude: number;
  longitude: number;
};

export const BRAZZAVILLE_CENTER = { latitude: -4.2634, longitude: 15.2429 };
export const POINTE_NOIRE_CENTER = { latitude: -4.7692, longitude: 11.8664 };

export const GEO_PLACES: GeoPlace[] = [
  // ── Brazzaville – arrondissements & quartiers ──
  { name: 'Centre-ville', city: 'Brazzaville', latitude: -4.2722, longitude: 15.2854 },
  { name: 'Poto-Poto', city: 'Brazzaville', latitude: -4.2584, longitude: 15.2714 },
  { name: 'Bacongo', city: 'Brazzaville', latitude: -4.2787, longitude: 15.2764 },
  { name: 'Makélékélé', city: 'Brazzaville', latitude: -4.2953, longitude: 15.2538 },
  { name: 'Moungali', city: 'Brazzaville', latitude: -4.2449, longitude: 15.2522 },
  { name: 'Ouenzé', city: 'Brazzaville', latitude: -4.2386, longitude: 15.2681 },
  { name: 'Talangaï', city: 'Brazzaville', latitude: -4.2156, longitude: 15.2588 },
  { name: 'Mfilou', city: 'Brazzaville', latitude: -4.2245, longitude: 15.2388 },
  { name: 'Djiri', city: 'Brazzaville', latitude: -4.1833, longitude: 15.2683 },
  { name: 'Goma Tsé-Tsé', city: 'Brazzaville', latitude: -4.2483, longitude: 15.2922 },
  { name: 'Kinsounda', city: 'Brazzaville', latitude: -4.2826, longitude: 15.2504 },
  { name: 'Mikalou', city: 'Brazzaville', latitude: -4.3058, longitude: 15.2687 },
  { name: 'Ngamaba', city: 'Brazzaville', latitude: -4.3101, longitude: 15.2761 },
  { name: 'Bilolo', city: 'Brazzaville', latitude: -4.2921, longitude: 15.2637 },
  { name: 'Massina', city: 'Brazzaville', latitude: -4.2701, longitude: 15.2528 },
  { name: 'Aéroport Maya-Maya', city: 'Brazzaville', latitude: -4.2517, longitude: 15.2531 },
  { name: 'Plateau des 15 ans', city: 'Brazzaville', latitude: -4.2277, longitude: 15.2744 },
  { name: 'Moukondo', city: 'Brazzaville', latitude: -4.2549, longitude: 15.2396 },
  { name: 'Ouenzé Centre', city: 'Brazzaville', latitude: -4.2398, longitude: 15.2664 },
  { name: 'Mpila', city: 'Brazzaville', latitude: -4.2514, longitude: 15.2607 },
  { name: 'Rue Mbama', city: 'Brazzaville', latitude: -4.2738, longitude: 15.2811 },
  { name: 'Maya-Maya', city: 'Brazzaville', latitude: -4.2498, longitude: 15.2562 },

  // ── Pointe-Noire – quartiers ──
  { name: 'Centre-ville', city: 'Pointe-Noire', latitude: -4.7781, longitude: 11.8621 },
  { name: 'Mpita', city: 'Pointe-Noire', latitude: -4.7692, longitude: 11.8664 },
  { name: 'Tié-Tié', city: 'Pointe-Noire', latitude: -4.787, longitude: 11.8537 },
  { name: 'Loandjili', city: 'Pointe-Noire', latitude: -4.746, longitude: 11.8195 },
  { name: 'Mongo Kamba', city: 'Pointe-Noire', latitude: -4.7599, longitude: 11.8203 },
  { name: 'Songolo', city: 'Pointe-Noire', latitude: -4.8073, longitude: 11.9 },
  { name: 'Ndjini', city: 'Pointe-Noire', latitude: -4.7294, longitude: 11.8446 },
  { name: 'Aéroport', city: 'Pointe-Noire', latitude: -4.8136, longitude: 11.8866 },
  { name: 'Symphonie', city: 'Pointe-Noire', latitude: -4.7752, longitude: 11.8564 },
  { name: 'Fontaine de Jade', city: 'Pointe-Noire', latitude: -4.7826, longitude: 11.8682 },
  { name: 'M’Poukou', city: 'Pointe-Noire', latitude: -4.7732, longitude: 11.8751 },
  { name: 'Mangoumbou', city: 'Pointe-Noire', latitude: -4.7982, longitude: 11.8776 },
  { name: 'La Source', city: 'Pointe-Noire', latitude: -4.7579, longitude: 11.8309 },
  { name: 'Mvoumvou', city: 'Pointe-Noire', latitude: -4.8172, longitude: 11.8967 },
  { name: 'Kizanga', city: 'Pointe-Noire', latitude: -4.8081, longitude: 11.8622 },
  { name: 'Nsanga', city: 'Pointe-Noire', latitude: -4.7387, longitude: 11.7992 },
  { name: 'Moko', city: 'Pointe-Noire', latitude: -4.7628, longitude: 11.8455 },
  { name: 'Siafoumou', city: 'Pointe-Noire', latitude: -4.757, longitude: 11.841 },
  { name: 'Siafoumou-Centre', city: 'Pointe-Noire', latitude: -4.7553, longitude: 11.8392 },
  { name: 'Ligne Rouge', city: 'Pointe-Noire', latitude: -4.7613, longitude: 11.8478 },
  { name: 'Ngoyo', city: 'Pointe-Noire', latitude: -4.7198, longitude: 11.8792 },
  { name: 'Kolo Kolo', city: 'Pointe-Noire', latitude: -4.7913, longitude: 11.8664 },
  { name: 'Voungou', city: 'Pointe-Noire', latitude: -4.7867, longitude: 11.8831 },
  { name: 'Mboukou', city: 'Pointe-Noire', latitude: -4.7462, longitude: 11.8571 },
];

/** Normalise un texte pour la comparaison de recherche. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Recherche locale de quartiers, priorisée par la ville ciblée.
 * Renvoie les correspondances (début de mot ou inclusion).
 */
export function searchLocalPlaces(
  query: string,
  city: 'brazzaville' | 'pointe-noire',
  limit = 6,
): GeoPlace[] {
  const q = normalize(query);
  if (q.length === 0) return [];

  const cityName = city === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville';
  const tokens = q.split(' ').filter(Boolean);

  // On cherche dans TOUTES les villes (Brazzaville et Pointe-Noire) pour
  // qu'un quartier de Pointe-Noire puisse être trouvé même quand la ville
  // cible est Brazzaville. On priorise simplement la ville cible au tri.
  const scored = GEO_PLACES.filter((p) => {
    const name = normalize(p.name);
    const cityNorm = normalize(p.city);
    return tokens.some(
      (t) => name.includes(t) || name.startsWith(t) || cityNorm.includes(t),
    );
  }).map((p) => {
    const name = normalize(p.name);
    let score = 0;
    if (name.startsWith(q)) score += 3;
    if (name.includes(q)) score += 2;
    if (p.city === cityName) score += 1;
    return { place: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.place);
}

/** Distance en km entre deux points (formule de Haversine). */
export function distanceKmBetween(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Retourne le quartier local le plus proche d'un point donné.
 * Permet de donner un nom de quartier même quand le reverse-geocoding
 * du système ne renvoie rien d'utile.
 * Cherche dans les deux villes : on priorise la ville cible, mais si le
 * point est clairement dans l'autre ville (plus proche d'un quartier de
 * celle-ci), on renvoie le quartier le plus proche globalement.
 */
export function nearestLocalPlace(
  coords: { latitude: number; longitude: number },
  city: 'brazzaville' | 'pointe-noire',
  maxDistanceKm = 12,
): GeoPlace | null {
  const cityName = city === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville';
  let best: { place: GeoPlace; dist: number } | null = null;
  let bestOther: { place: GeoPlace; dist: number } | null = null;
  for (const place of GEO_PLACES) {
    const dist = distanceKmBetween(coords, place);
    if (dist > maxDistanceKm) continue;
    if (place.city === cityName) {
      if (!best || dist < best.dist) best = { place, dist };
    } else if (!bestOther || dist < bestOther.dist) {
      bestOther = { place, dist };
    }
  }
  // Si aucun quartier de la ville cible, on retombe sur l'autre ville.
  if (!best && bestOther) return bestOther.place;
  return best?.place ?? null;
}
