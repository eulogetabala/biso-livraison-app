import type { CreateOrderInput, MenuItemModel, RestaurantModel, UserModel } from '../graphql/types';
import { initialMockOrders, mockDrivers, mockMenuItems, mockProducts, mockRestaurants, mockUser, type MockOrder } from './data';

let currentUser: UserModel = { ...mockUser };
let orders: MockOrder[] = [...initialMockOrders];

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (!restaurant) {
    throw new Error('restaurant unavailable');
  }

  const items = input.items.map((entry) => {
    const menuItem = mockMenuItems.find((item) => item.id === String(entry.menuItemId));
    return {
      quantity: entry.quantity,
      unitPrice: menuItem?.price ?? 0,
      menuItem: menuItem ? { id: menuItem.id, name: menuItem.name, price: menuItem.price } : null,
    };
  });

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const deliveryFee = restaurant.deliveryFee;
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
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.imageUrl ?? null,
      phone: restaurant.phone,
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
