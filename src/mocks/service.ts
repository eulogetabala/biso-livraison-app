import type { CreateOrderInput, MenuItemModel, RestaurantModel, UserModel } from '../graphql/types';
import { computeDeliveryFee, mockRestaurantDistanceKm } from '../lib/pricing';
import { initialMockOrders, mockDrivers, mockMenuItems, mockProducts, mockRestaurants, mockUser, type MockOrder } from './data';

let currentUser: UserModel = { ...mockUser };
let orders: MockOrder[] = [...initialMockOrders];

const pendingOtps = new Map<string, { code: string; expiresAt: number }>();

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Simule l'envoi d'un SMS OTP. En mode démo, le code est loggé et retourné pour l'UI. */
export async function mockRequestOtp(phone: string) {
  await wait(120);
  const code = generateOtpCode();
  pendingOtps.set(phone, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
  console.log(`[MOCK SMS] Code OTP pour ${phone} : ${code}`);
  return {
    phone,
    expiresIn: 10 * 60,
    devCode: code,
  };
}

/** Vérifie le code OTP en mémoire. */
export async function mockVerifyOtp(phone: string, code: string): Promise<boolean> {
  await wait(180);
  const pending = pendingOtps.get(phone);
  if (!pending || pending.code !== code.trim()) {
    throw new Error('Code invalide ou déjà utilisé.');
  }
  if (pending.expiresAt < Date.now()) {
    pendingOtps.delete(phone);
    throw new Error('Ce code a expiré. Veuillez en demander un nouveau.');
  }
  pendingOtps.delete(phone);
  return true;
}

export async function mockLogin(phone: string, password: string) {
  await wait();
  if (!phone.trim() || !password.trim()) {
    throw new Error('Invalid credentials');
  }
  currentUser = {
    ...currentUser,
    phone: phone.startsWith('+242') ? phone : `+242${phone.replace(/\s+/g, '')}`,
    email: `${phone.replace(/\s+/g, '')}@phone.biso`,
    updatedAt: new Date().toISOString(),
  };
  return {
    accessToken: 'mock-access-token',
    user: currentUser,
  };
}

export async function mockRegister(input: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}) {
  await wait();
  currentUser = {
    ...currentUser,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: `${input.phone.replace(/\s+/g, '')}@phone.biso`,
    updatedAt: new Date().toISOString(),
  };
  return {
    accessToken: 'mock-access-token',
    user: currentUser,
  };
}

export async function getMockRestaurants(filters?: { query?: string; cuisineType?: string }) {
  await wait(120);
  let result = [...mockRestaurants];
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.cuisineType.toLowerCase().includes(q),
    );
  }
  if (filters?.cuisineType) {
    result = result.filter((r) => r.cuisineType === filters.cuisineType);
  }
  return result;
}

export async function getMockProducts() {
  await wait(120);
  return [...mockProducts];
}

export async function getMockDrivers() {
  await wait(120);
  return mockDrivers.filter((driver) => driver.available);
}

export async function getMockDriverById(id: string) {
  await wait(120);
  return mockDrivers.find((driver) => driver.id === id) ?? null;
}

export function getMockRestaurantCoordinates(id: string) {
  const coordinates: Record<string, { latitude: number; longitude: number }> = {
    'rest-1': { latitude: -4.2634, longitude: 15.2429 },
    'rest-2': { latitude: -4.2695, longitude: 15.2712 },
    'rest-3': { latitude: -4.2511, longitude: 15.2558 },
  };
  return coordinates[id];
}

/** Coordonnées (mock) de livraison associées à chaque commande. */
const MOCK_DELIVERY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'order-1001': { latitude: -4.2722, longitude: 15.2854 },
  'order-1002': { latitude: -4.7692, longitude: 11.8664 },
  'order-1003': { latitude: -4.2245, longitude: 15.2388 },
};

export function getMockDeliveryCoordinates(orderId: string) {
  return MOCK_DELIVERY_COORDINATES[orderId] ?? { latitude: -4.2634, longitude: 15.2522 };
}

export function getMockRestaurantById(id: string): RestaurantModel | undefined {
  return mockRestaurants.find((restaurant) => restaurant.id === id);
}

export function getMockMenuByRestaurant(restaurantId: string): MenuItemModel[] {
  return mockMenuItems.filter((item) => item.restaurantId === restaurantId);
}

export async function getMockOrders() {
  await wait(120);
  return [...orders];
}

export function getMockOrderById(id: string) {
  return orders.find((order) => order.id === id);
}

export async function createMockOrder(input: CreateOrderInput) {
  await wait(300);
  const restaurant = getMockRestaurantById(String(input.restaurantId));
  const fallbackRestaurant = {
    id: 'market',
    name: 'Biso Market',
    deliveryFee: 0,
    imageUrl: null as string | null,
    phone: '',
  };
  if (!restaurant && input.restaurantId !== 'market') {
    throw new Error('restaurant unavailable');
  }
  const source = restaurant ?? fallbackRestaurant;

  const items = input.items.map((entry) => {
    const menuItem = mockMenuItems.find((item) => item.id === String(entry.menuItemId));
    return {
      quantity: entry.quantity,
      unitPrice: menuItem?.price ?? 0,
      menuItem: menuItem ? { id: menuItem.id, name: menuItem.name, price: menuItem.price } : null,
    };
  });

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const deliveryFee = computeDeliveryFee(mockRestaurantDistanceKm(String(source.id)));
  const created: MockOrder = {
    id: `order-${Date.now()}`,
    status: 'PENDING',
    total,
    deliveryFee,
    grandTotal: total + deliveryFee,
    deliveryAddress: input.deliveryAddress,
    deliveryCity: input.deliveryCity,
    deliveryZipCode: input.deliveryZipCode,
    createdAt: new Date().toISOString(),
    restaurant: {
      id: source.id,
      name: source.name,
      imageUrl: source.imageUrl ?? null,
      phone: source.phone,
    },
    items,
    payment: {
      method: 'CASH_ON_DELIVERY',
      status: 'PENDING',
      amount: total + deliveryFee,
    },
    delivery: {
      id: `delivery-${Date.now()}`,
      status: 'ASSIGNED',
      driver: { id: 'driver-mock', firstName: 'Biso', lastName: 'Express', phone: '+242066999888' },
    },
  };

  orders = [created, ...orders];
  return created;
}

export async function cancelMockOrder(id: string | number) {
  await wait(180);
  const index = orders.findIndex((order) => order.id === String(id));
  if (index === -1) {
    throw new Error('Order not found');
  }
  orders[index] = {
    ...orders[index],
    status: 'CANCELLED',
    delivery: orders[index].delivery
      ? { ...orders[index].delivery, status: 'DELIVERED' }
      : null,
  };
  return orders[index];
}
