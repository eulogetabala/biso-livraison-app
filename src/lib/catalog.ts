import { assetUrl } from './api';

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  seller: string;
  price: number;
  imageUrl: string;
  badge?: string;
};

export function menuItemToCatalogProduct(item: {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  seller?: string | null;
  badge?: string | null;
  marketCategory?: { id: string; label: string } | null;
}): CatalogProduct {
  return {
    id: item.id,
    name: item.name,
    category: item.marketCategory?.label ?? 'Epicerie',
    categoryId: item.marketCategory?.id,
    seller: item.seller ?? 'Particulier',
    price: item.price,
    imageUrl: assetUrl(item.imageUrl) ?? '',
    badge: item.badge ?? undefined,
  };
}

export function filterProductsByCategory(
  products: CatalogProduct[],
  category?: string,
): CatalogProduct[] {
  if (!category) return products;
  return products.filter(
    (product) =>
      product.categoryId === category ||
      product.category.toLowerCase() === category.toLowerCase(),
  );
}

/** @deprecated Utiliser menuItemToCatalogProduct */
export const parseMarketMenuItem = menuItemToCatalogProduct;
