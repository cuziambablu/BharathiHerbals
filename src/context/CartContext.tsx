"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

export interface CartItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();

  // Hydrate from localStorage or Supabase
  useEffect(() => {
    const loadCart = async () => {
      let currentItems: CartItem[] = [];
      
      // ALWAYS start with localStorage as a fast fallback
      try {
        const saved = localStorage.getItem("bharathi-cart");
        if (saved) currentItems = JSON.parse(saved);
      } catch (e) {}

      if (user) {
        console.log("🛒 [CART] Syncing with Supabase for:", user.email);
        const { data, error } = await supabase
          .from('cart')
          .select('*, product:products(*)') // Resilient join
          .eq('user_id', user.id);

        if (!error && data && data.length > 0) {
          const dbItems = data
            .filter((item: any) => item.product)
            .map((item: any) => ({
              productId: item.product_id,
              name: item.product.product_name,
              size: item.bottle_size,
              price: Number(item.product.price),
              quantity: item.quantity,
              image: (item.product.image_urls && item.product.image_urls[0]) || ''
            }));
          
          if (dbItems.length > 0) currentItems = dbItems;
        }
      }
      
      setItems(currentItems);
      setHydrated(true);
    };
    loadCart();
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated && !user) {
      localStorage.setItem("bharathi-cart", JSON.stringify(items));
    }
  }, [items, hydrated, user]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((p) => !p), []);

  const addToCart = useCallback(async (item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.size === item.size
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });

    if (user) {
      // Background sync
      supabase.from('cart').select('quantity').eq('user_id', user.id).eq('product_id', item.productId).eq('bottle_size', item.size).single().then(({ data: existing }) => {
        if (existing) {
          supabase.from('cart').update({ quantity: existing.quantity + qty }).eq('user_id', user.id).eq('product_id', item.productId).eq('bottle_size', item.size).then();
        } else {
          supabase.from('cart').insert({ user_id: user.id, product_id: item.productId, quantity: qty, bottle_size: item.size }).then();
        }
      });
    }

    setIsOpen(true);
  }, [user]);

  const removeFromCart = useCallback(async (productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    );

    if (user) {
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('bottle_size', size);
    }
  }, [user]);

  const updateQuantity = useCallback(
    async (productId: string, size: string, qty: number) => {
      if (qty <= 0) {
        removeFromCart(productId, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: qty }
            : i
        )
      );

      if (user) {
        await supabase
          .from('cart')
          .update({ quantity: qty })
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .eq('bottle_size', size);
      }
    },
    [removeFromCart, user]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await supabase.from('cart').delete().eq('user_id', user.id);
    }
    setIsOpen(false);
  }, [user]);


  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
