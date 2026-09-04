import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MenuItemModel } from '../graphql/types';

const CART_STORAGE_KEY = 'biso_cart_v1';

export type CartSupplement = {
  id?: string;
  name: string;
  price: number;
};

export type CartLine = {
  key: string;
  menuItem: MenuItemModel;
  quantity: number;
  supplements: CartSupplement[];
};

export type CartInfo = {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  lines: CartLine[];
};

export function getLineKey(menuItemId: string, supplements: CartSupplement[] = []): string {
  const supKey = supplements
    .map((s) => s.id ?? s.name)
    .sort()
    .join(',');
  return `${menuItemId}|${supKey}`;
}

export function lineUnitPrice(line: CartLine): number {
  const supplementsTotal = line.supplements.reduce((sum, s) => sum + s.price, 0);
  return line.menuItem.price + supplementsTotal;
}

type CartContextValue = {
  cart: CartInfo;
  count: number;
  subtotal: number;
  total: number;
  addItem: (
    menuItem: MenuItemModel,
    restaurantId: string,
    restaurantName: string,
    deliveryFee: number,
    supplements?: CartSupplement[],
    quantity?: number,
  ) => void;
  removeItem: (lineKey: string) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  clear: () => void;
};

const emptyCart: CartInfo = {
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  lines: [],
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartInfo>(emptyCart);
  const hydratedRef = useRef(false);

  // Restaure le panier depuis le stockage local au démarrage.
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.lines)) {
              setCart(parsed);
            }
          } catch {
            // Ignore un cache corrompu.
          }
        }
        hydratedRef.current = true;
      })
      .catch(() => {
        hydratedRef.current = true;
      });
  }, []);

  // Persiste le panier à chaque modification (après hydratation initiale).
  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  const addItem = useCallback(
    (
      menuItem: MenuItemModel,
      restaurantId: string,
      restaurantName: string,
      deliveryFee: number,
      supplements: CartSupplement[] = [],
      quantity = 1,
    ) => {
      setCart((prev) => {
        const key = getLineKey(menuItem.id, supplements);
        // On repart sur un nouveau restaurant -> on vide le panier.
        if (prev.restaurantId && prev.restaurantId !== restaurantId) {
          return {
            restaurantId,
            restaurantName,
            deliveryFee,
            lines: [{ key, menuItem, quantity, supplements }],
          };
        }
        const existing = prev.lines.find((l) => l.key === key);
        const lines = existing
          ? prev.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
          : [...prev.lines, { key, menuItem, quantity, supplements }];
        return {
          restaurantId,
          restaurantName,
          deliveryFee,
          lines,
        };
      });
    },
    [],
  );

  const removeItem = useCallback((lineKey: string) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.key !== lineKey),
    }));
  }, []);

  const setQuantity = useCallback((lineKey: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      lines:
        quantity <= 0
          ? prev.lines.filter((l) => l.key !== lineKey)
          : prev.lines.map((l) => (l.key === lineKey ? { ...l, quantity } : l)),
    }));
  }, []);

  const clear = useCallback(() => setCart(emptyCart), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const line of cart.lines) {
      count += line.quantity;
      subtotal += line.quantity * lineUnitPrice(line);
    }
    return { count, subtotal };
  }, [cart.lines]);

  const total = subtotal + cart.deliveryFee;

  const value = useMemo(
    () => ({ cart, count, subtotal, total, addItem, removeItem, setQuantity, clear }),
    [cart, count, subtotal, total, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
