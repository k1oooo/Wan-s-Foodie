"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { menuData } from "@/lib/menu-data";

export type CartState = Record<string, number>; // key: item name, value: quantity of boxes

interface CartContextValue {
  cart: CartState;
  setQuantity: (itemName: string, quantity: number) => void;
  removeItem: (itemName: string) => void;
  clearCart: () => void;
  totalBoxes: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "wans-foodies-cart";

function getItemPrice(itemName: string): number {
  for (const category of menuData) {
    const match = category.items.find((item) => item.name === itemName);
    if (match) return match.price;
  }
  return 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load persisted cart on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // Ignore malformed/unavailable storage
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Persist cart whenever it changes (after initial load)
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore write failures (e.g. private browsing)
    }
  }, [cart, hasLoaded]);

  function setQuantity(itemName: string, quantity: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[itemName];
      } else {
        next[itemName] = quantity;
      }
      return next;
    });
  }

  function removeItem(itemName: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  const totalBoxes = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce(
    (sum, [name, qty]) => sum + getItemPrice(name) * qty,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        setQuantity,
        removeItem,
        clearCart,
        totalBoxes,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
