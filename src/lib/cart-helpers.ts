import type { MenuItemModel } from '../graphql/types';
import type { MockProduct } from '../mocks/data';

/** Identifiant "virtuel" du marché (produits hors restaurant) dans le panier. */
export const MARKET_RESTAURANT_ID = 'market';
export const MARKET_RESTAURANT_NAME = 'Biso Market';

/** Convertit un produit du marché en item de menu pour le panier. */
export function menuItemFromProduct(product: MockProduct): MenuItemModel {
  return {
    __typename: 'MenuItemModel',
    id: product.id,
    name: product.name,
    description: null,
    price: product.price,
    category: 'MAIN_COURSE',
    imageUrl: product.imageUrl,
    isAvailable: true,
    restaurantId: MARKET_RESTAURANT_ID,
    restaurant: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
