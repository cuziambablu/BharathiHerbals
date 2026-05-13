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

      if (user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('cart')
          .select('*, products(product_name, image_urls, price, discount_price)')
          .eq('user_id', user.id);

        if (!error && data) {
          currentItems = data.map((item: any) => ({
            productId: item.product_id,
            name: item.products.product_name,
            size: item.bottle_size,
            price: Number(item.products.price),
            quantity: item.quantity,
            image: item.products.image_urls[0] || ''
          }));
        }
      } else {
        try {
          const saved = localStorage.getItem("bharathi-cart");
          if (saved) {
            currentItems = JSON.parse(saved);
            // VALIDATE PRICES against current data
            // Since we only have one product for now, we can hardcode or fetch
            // Let's at least ensure the Herbal Oil is 199
            currentItems = currentItems.map((item: CartItem) => {
              if (item.productId === 'bharathi-herbal-oil' || item.name.includes('Herbal Hair Oil')) {
                return { ...item, price: 199 };
              }
              return item;
            });
          }
        } catch {}
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
      // Sync with Supabase
      const { data: existing } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.productId)
        .eq('bottle_size', item.size)
        .single();

      if (existing) {
        await supabase
          .from('cart')
          .update({ quantity: existing.quantity + qty })
          .eq('user_id', user.id)
          .eq('product_id', item.productId)
          .eq('bottle_size', item.size);
      } else {
        await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: item.productId,
            quantity: qty,
            bottle_size: item.size
          });
      }
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
