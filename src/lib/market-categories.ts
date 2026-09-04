import type { ActiveMarketCategoriesQuery } from '../graphql/operations';

export type MarketCategory = {
  key: string;
  id: string;
  label: string;
  subtitle: string;
  image: string;
  icon: string;
  lib: 'ionicons' | 'mci' | 'feather' | 'image';
  tint: string;
  iconColor: string;
  count: number;
};

function isImageIcon(icon: string, lib?: string): boolean {
  return lib === 'image' || icon.startsWith('http') || icon.startsWith('/');
}

function categoryKey(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export function mapApiMarketCategories(
  categories: ActiveMarketCategoriesQuery['activeMarketCategories'],
  productCounts: Record<string, number>,
): MarketCategory[] {
  return categories.map((cat) => ({
    key: categoryKey(cat.label),
    id: cat.id,
    label: cat.label,
    subtitle: cat.subtitle ?? 'Produits disponibles',
    image: cat.imageUrl ?? '',
    icon: cat.icon,
    lib: (cat.iconLib as MarketCategory['lib']) ?? (isImageIcon(cat.icon) ? 'image' : 'ionicons'),
    tint: cat.tint,
    iconColor: cat.iconColor,
    count: productCounts[cat.id] ?? 0,
  }));
}

export function countProductsByCategory(
  items: { marketCategoryId?: string | null }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (item.marketCategoryId) {
      counts[item.marketCategoryId] = (counts[item.marketCategoryId] ?? 0) + 1;
    }
  }
  return counts;
}
