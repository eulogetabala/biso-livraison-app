import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MenuItemModel } from '../graphql/types';

export type CartLine = {
  menuItem: MenuItemModel;
  quantity: number;
};

export type CartInfo = {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  lines: CartLine[];
};

type CartContextValue = {
  cart: CartInfo;
  count: number;
  subtotal: number;
  total: number;
  addItem: (menuItem: MenuItemModel, restaurantId: string, restaurantName: string, deliveryFee: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
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

  const addItem = useCallback(
    (menuItem: MenuItemModel, restaurantId: string, restaurantName: string, deliveryFee: number) => {
      setCart((prev) => {
        // On repart sur un nouveau restaurant -> on vide le panier.
        if (prev.restaurantId && prev.restaurantId !== restaurantId) {
          return {
            restaurantId,
            restaurantName,
            deliveryFee,
            lines: [{ menuItem, quantity: 1 }],
          };
        }
        const existing = prev.lines.find((l) => l.menuItem.id === menuItem.id);
        const lines = existing
          ? prev.lines.map((l) => (l.menuItem.id === menuItem.id ? { ...l, quantity: l.quantity + 1 } : l))
          : [...prev.lines, { menuItem, quantity: 1 }];
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

  const removeItem = useCallback((menuItemId: string) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.menuItem.id !== menuItemId),
    }));
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      lines:
        quantity <= 0
          ? prev.lines.filter((l) => l.menuItem.id !== menuItemId)
          : prev.lines.map((l) => (l.menuItem.id === menuItemId ? { ...l, quantity } : l)),
    }));
  }, []);

  const clear = useCallback(() => setCart(emptyCart), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const line of cart.lines) {
      count += line.quantity;
      subtotal += line.quantity * line.menuItem.price;
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
