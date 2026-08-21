import type { MenuItemModel, MenuItemCategory, OrderStatus, PaymentStatus, RestaurantModel, UserModel } from '../graphql/types';

const now = new Date();
const iso = (offsetMinutes = 0) => new Date(now.getTime() + offsetMinutes * 60_000).toISOString();

export const mockUser: UserModel = {
  __typename: 'UserModel',
  id: 'mock-user-1',
  email: '242066123456@phone.biso',
  firstName: 'Euloge',
  lastName: 'Tabala',
  phone: '+242066123456',
  role: 'CLIENT',
  avatarUrl: null,
  createdAt: iso(-60 * 24 * 120),
  updatedAt: iso(),
};

export const mockRestaurants: RestaurantModel[] = [
  {
    __typename: 'RestaurantModel',
    id: 'rest-1',
    name: 'Nganda Premium',
    description: 'Cuisine congolaise raffinée avec grillades, saka-saka et plats généreux.',
    address: 'Avenue de la Paix',
    city: 'Brazzaville',
    zipCode: '0000',
    phone: '+242055000001',
    cuisineType: 'AFRICAIN',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    deliveryFee: 1000,
    estimatedDeliveryTime: 25,
    isActive: true,
    createdAt: iso(-5000),
    updatedAt: iso(-50),
  },
  {
    __typename: 'RestaurantModel',
    id: 'rest-2',
    name: 'Pizza Maya',
    description: 'Pizzas gourmandes, burgers maison et desserts frais pour toute la famille.',
    address: 'Boulevard Denis Sassou Nguesso',
    city: 'Pointe-Noire',
    zipCode: '0001',
    phone: '+242055000002',
    cuisineType: 'PIZZA',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    deliveryFee: 1000,
    estimatedDeliveryTime: 30,
    isActive: true,
    createdAt: iso(-4000),
    updatedAt: iso(-40),
  },
  {
    __typename: 'RestaurantModel',
    id: 'rest-3',
    name: 'Green Bowl',
    description: 'Salades, bowls et jus naturels pour une pause légère et moderne.',
    address: 'Rue Mfoa',
    city: 'Brazzaville',
    zipCode: '0002',
    phone: '+242055000003',
    cuisineType: 'SALADE',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
    rating: 4.4,
    deliveryFee: 1000,
    estimatedDeliveryTime: 20,
    isActive: true,
    createdAt: iso(-3000),
    updatedAt: iso(-30),
  },
];

function menuItem(
  id: string,
  restaurantId: string,
  name: string,
  price: number,
  category: MenuItemCategory,
  description: string,
  imageUrl?: string,
): MenuItemModel {
  return {
    __typename: 'MenuItemModel',
    id,
    name,
    description,
    price,
    category,
    imageUrl: imageUrl ?? null,
    isAvailable: true,
    restaurantId,
    restaurant: null,
    createdAt: iso(-1000),
    updatedAt: iso(-20),
  };
}

export const mockMenuItems: MenuItemModel[] = [
  menuItem('m-1', 'rest-1', 'Poulet braisé', 4500, 'MAIN_COURSE', 'Poulet tendre, plantain et sauce maison.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=900&auto=format&fit=crop'),
  menuItem('m-2', 'rest-1', 'Saka-saka', 3000, 'SIDE', 'Feuilles de manioc relevées, cuisson traditionnelle.'),
  menuItem('m-10', 'rest-1', 'Riz sauté', 1500, 'SIDE', 'Riz parfumé sauté aux légumes et épices.'),
  menuItem('m-11', 'rest-1', 'Légumes vapeur', 1000, 'SIDE', 'Légumes frais du jour cuits à la vapeur.'),
  menuItem('m-12', 'rest-1', 'Plantain mûr', 1200, 'SIDE', 'Bananes plantains mûres bien dorées.'),
  menuItem('m-3', 'rest-1', 'Jus de bissap', 1500, 'DRINK', 'Jus frais légèrement sucré.'),
  menuItem('m-4', 'rest-2', 'Pizza pepperoni', 6000, 'MAIN_COURSE', 'Pâte fine, pepperoni, mozzarella fondante.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=900&auto=format&fit=crop'),
  menuItem('m-5', 'rest-2', 'Burger maya', 5500, 'MAIN_COURSE', 'Steak juteux, cheddar, sauce signature.'),
  menuItem('m-6', 'rest-2', 'Tiramisu', 2500, 'DESSERT', 'Dessert léger au café et cacao.'),
  menuItem('m-7', 'rest-3', 'Chicken bowl', 5000, 'LUNCH', 'Bowl complet au poulet grillé et crudités.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=900&auto=format&fit=crop'),
  menuItem('m-8', 'rest-3', 'Salade avocat', 3500, 'APPETIZER', 'Avocat frais, tomates, vinaigrette citronnée.'),
  menuItem('m-9', 'rest-3', 'Smoothie mangue', 2000, 'DRINK', 'Mangue mixée, lait frais et glaçons.'),
];

export type MockProduct = {
  id: string;
  name: string;
  category: string;
  seller: string;
  price: number;
  imageUrl: string;
  badge?: string;
  distanceKm: number;
};

export const mockProducts: MockProduct[] = [
  {
    id: 'p-1',
    name: 'Pain brioché du matin',
    category: 'Boulangerie',
    seller: 'Chez Maman Solange',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=900&auto=format&fit=crop',
    badge: 'Du jour',
    distanceKm: 1.4,
  },
  {
    id: 'p-2',
    name: 'Gâteau vanille maison',
    category: 'Desserts',
    seller: 'Atelier Grâce',
    price: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop',
    badge: 'Fait maison',
    distanceKm: 2.6,
  },
  {
    id: 'p-3',
    name: 'Croissants beurre',
    category: 'Boulangerie',
    seller: 'La Fournée',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=900&auto=format&fit=crop',
    badge: 'Populaire',
    distanceKm: 0.9,
  },
  {
    id: 'p-4',
    name: 'Jus gingembre ananas',
    category: 'Boissons',
    seller: 'Fresh Mama',
    price: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=900&auto=format&fit=crop',
    badge: 'Très frais',
    distanceKm: 3.1,
  },
  {
    id: 'p-5',
    name: 'Eau minérale pack',
    category: 'Boissons',
    seller: 'Market Express',
    price: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1564419439262-c0c9b2f90b41?q=80&w=900&auto=format&fit=crop',
    badge: 'Essentiel',
    distanceKm: 1.8,
  },
  {
    id: 'p-6',
    name: 'Cuisse de poulet fermier',
    category: 'Volailles',
    seller: 'Ferme du Fleuve',
    price: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=900&auto=format&fit=crop',
    badge: 'Frais',
    distanceKm: 2.3,
  },
  {
    id: 'p-7',
    name: 'Viande de boeuf découpée',
    category: 'Boucherie',
    seller: 'Boucherie Centre',
    price: 5800,
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=900&auto=format&fit=crop',
    badge: 'Qualité',
    distanceKm: 2.1,
  },
  {
    id: 'p-8',
    name: 'Mangues bien mûres',
    category: 'Fruits',
    seller: 'Marché Total',
    price: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=900&auto=format&fit=crop',
    badge: 'Saison',
    distanceKm: 1.1,
  },
  {
    id: 'p-9',
    name: 'Panier de légumes frais',
    category: 'Légumes',
    seller: 'Potager Vert',
    price: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop',
    badge: 'Local',
    distanceKm: 1.6,
  },
  {
    id: 'p-10',
    name: 'Riz parfumé 5kg',
    category: 'Epicerie',
    seller: 'Biso Market',
    price: 9000,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',
    badge: 'Famille',
    distanceKm: 3.4,
  },
];

export type MockDriver = {
  id: string;
  firstName: string;
  lastName: string;
  type: 'Moto' | 'Express' | 'Interville';
  etaMinutes: number;
  zone: string;
  rating: number;
  available: boolean;
};

export const mockDrivers: MockDriver[] = [
  { id: 'd-1', firstName: 'Armel', lastName: 'Mavoungou', type: 'Express', etaMinutes: 8, zone: 'Centre-ville', rating: 4.9, available: true },
  { id: 'd-2', firstName: 'Merveille', lastName: 'Nkaya', type: 'Moto', etaMinutes: 12, zone: 'Talangaï', rating: 4.8, available: true },
  { id: 'd-3', firstName: 'Junior', lastName: 'Mboko', type: 'Interville', etaMinutes: 25, zone: 'Brazzaville → Pointe-Noire', rating: 4.7, available: true },
];

export type MockOrder = {
  id: string;
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  grandTotal: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryZipCode: string;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    imageUrl: string | null;
    phone: string;
  } | null;
  items: Array<{
    quantity: number;
    unitPrice: number;
    menuItem: { id: string; name: string; price: number } | null;
  }>;
  payment: {
    method: 'CASH_ON_DELIVERY';
    status: PaymentStatus;
    amount: number;
  } | null;
  delivery: {
    id: string;
    status: 'ASSIGNED' | 'IN_TRANSIT' | 'PICKED_UP' | 'DELIVERED';
    driver: { id: string; firstName: string; lastName: string; phone: string } | null;
  } | null;
};

export const initialMockOrders: MockOrder[] = [
  {
    id: 'order-1001',
    status: 'IN_TRANSIT',
    total: 4500,
    deliveryFee: 1000,
    grandTotal: 5500,
    deliveryAddress: '45 avenue Matsoua',
    deliveryCity: 'Brazzaville',
    deliveryZipCode: '0000',
    createdAt: iso(-70),
    restaurant: {
      id: 'rest-1',
      name: 'Nganda Premium',
      imageUrl: mockRestaurants[0].imageUrl ?? null,
      phone: mockRestaurants[0].phone,
    },
    items: [{ quantity: 1, unitPrice: 4500, menuItem: { id: 'm-1', name: 'Poulet braisé', price: 4500 } }],
    payment: { method: 'CASH_ON_DELIVERY', status: 'PENDING', amount: 5500 },
    delivery: {
      id: 'delivery-1',
      status: 'IN_TRANSIT',
      driver: { id: 'driver-1', firstName: 'Armel', lastName: 'Mavoungou', phone: '+242066000111' },
    },
  },
  {
    id: 'order-1002',
    status: 'PREPARING',
    total: 6000,
    deliveryFee: 1000,
    grandTotal: 7000,
    deliveryAddress: '12 rue Loango',
    deliveryCity: 'Pointe-Noire',
    deliveryZipCode: '0001',
    createdAt: iso(-140),
    restaurant: {
      id: 'rest-2',
      name: 'Pizza Maya',
      imageUrl: mockRestaurants[1].imageUrl ?? null,
      phone: mockRestaurants[1].phone,
    },
    items: [{ quantity: 1, unitPrice: 6000, menuItem: { id: 'm-4', name: 'Pizza pepperoni', price: 6000 } }],
    payment: { method: 'CASH_ON_DELIVERY', status: 'PENDING', amount: 7000 },
    delivery: {
      id: 'delivery-2',
      status: 'ASSIGNED',
      driver: { id: 'driver-2', firstName: 'Merveille', lastName: 'Nkaya', phone: '+242066000222' },
    },
  },
  {
    id: 'order-1003',
    status: 'DELIVERED',
    total: 7000,
    deliveryFee: 1000,
    grandTotal: 8000,
    deliveryAddress: '8 rue de Mfilou',
    deliveryCity: 'Brazzaville',
    deliveryZipCode: '0002',
    createdAt: iso(-800),
    restaurant: {
      id: 'rest-3',
      name: 'Green Bowl',
      imageUrl: mockRestaurants[2].imageUrl ?? null,
      phone: mockRestaurants[2].phone,
    },
    items: [
      { quantity: 1, unitPrice: 5000, menuItem: { id: 'm-7', name: 'Chicken bowl', price: 5000 } },
      { quantity: 1, unitPrice: 2000, menuItem: { id: 'm-9', name: 'Smoothie mangue', price: 2000 } },
    ],
    payment: { method: 'CASH_ON_DELIVERY', status: 'PAID', amount: 8000 },
    delivery: {
      id: 'delivery-3',
      status: 'DELIVERED',
      driver: { id: 'driver-3', firstName: 'Junior', lastName: 'Mboko', phone: '+242066000333' },
    },
  },
];
