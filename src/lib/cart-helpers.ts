import { MARKET_RESTAURANT_ID, MARKET_RESTAURANT_NAME } from '../config/seed-ids';
import type { MenuItemModel } from '../graphql/types';
import type { CatalogProduct } from './catalog';

export { MARKET_RESTAURANT_ID, MARKET_RESTAURANT_NAME };

/** @deprecated Utiliser CatalogProduct depuis catalog.ts */
export function menuItemFromProduct(product: CatalogProduct): MenuItemModel {
  return {
    __typename: 'MenuItemModel',
    id: product.id,
    name: product.name,
    description: null,
    price: product.price,
    category: 'MAIN_COURSE',
    imageUrl: product.imageUrl,
    isAvailable: true,
    kind: 'SIMPLE_PRODUCT',
    restaurantId: null,
    restaurant: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
