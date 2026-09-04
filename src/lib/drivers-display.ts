type DriverLike = {
  id: string;
  vehicleType: string;
  isAvailable: boolean;
  rating: number;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type DriverDisplay = {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  etaMinutes: number;
  zone: string;
  rating: number;
  available: boolean;
};

const ZONE_BY_TYPE: Record<string, string> = {
  Express: 'Centre-ville',
  Moto: 'Talangaï',
  Interville: 'Brazzaville → Pointe-Noire',
};

export function driverToDisplay(driver: DriverLike): DriverDisplay {
  const type = driver.vehicleType;
  return {
    id: driver.id,
    firstName: driver.user?.firstName ?? 'Livreur',
    lastName: driver.user?.lastName ?? '',
    type,
    etaMinutes: type === 'Interville' ? 25 : type === 'Moto' ? 12 : 8,
    zone: ZONE_BY_TYPE[type] ?? 'Brazzaville',
    rating: driver.rating,
    available: driver.isAvailable,
  };
}
