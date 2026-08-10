"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "@/lib/types";

export interface CartLine {
  id: string; // menu_items.id
  name: string;
  category: Category;
  price: number; // price_per_box at the time it was added
  quantity: number; // boxes
}

export type CartState = Record<string, CartLine>; // key: menu_item id

interface CartContextValue {
  cart: CartState;
  setQuantity: (
    item: Pick<CartLine, "id" | "name" | "category" | "price">,
    quantity: number,
  ) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalBoxes: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Bumped from "wans-foodies-cart" to "wans-foodies-cart-v2" because the
// cart's shape changed (name-keyed number -> id-keyed CartLine object) when
// the site was connected to Supabase. Old-shape carts left in a returning
// visitor's browser would otherwise produce NaN totals.
const STORAGE_KEY = "wans-foodies-cart-v2";

function isValidCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).every(
    (line) =>
      line &&
      typeof line === "object" &&
      typeof (line as CartLine).id === "string" &&
      typeof (line as CartLine).name === "string" &&
      typeof (line as CartLine).price === "number" &&
      typeof (line as CartLine).quantity === "number" &&
      Number.isFinite((line as CartLine).price) &&
      Number.isFinite((line as CartLine).quantity),
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load persisted cart on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidCartState(parsed)) {
          setCart(parsed);
        } else {
          // Malformed or old-schema data — start fresh rather than crash.
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
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

  function setQuantity(
    item: Pick<CartLine, "id" | "name" | "category" | "price">,
    quantity: number,
  ) {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = { ...item, quantity };
      }
      return next;
    });
  }

  function removeItem(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  const lines = Object.values(cart);
  const totalBoxes = lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalPrice = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
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
