"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  items: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();

  // Hydrate
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', user.id);
        
        if (!error && data) {
          setItems(data.map(i => i.product_id));
        }
      } else {
        try {
          const saved = localStorage.getItem("bharathi-wishlist");
          if (saved) setItems(JSON.parse(saved));
        } catch {}
      }
      setHydrated(true);
    };
    loadWishlist();
  }, [user]);

  // Persist
  useEffect(() => {
    if (hydrated && !user) {
      localStorage.setItem("bharathi-wishlist", JSON.stringify(items));
    }
  }, [items, hydrated, user]);

  const addToWishlist = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i !== id));
  }, []);

  const toggleWishlist = useCallback(async (productId: string) => {
    setItems((prev) => {
      const exists = prev.includes(productId);
      const newItems = exists
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      
      if (user) {
        if (exists) {
          supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId).then();
        } else {
          supabase.from('wishlist').insert({ user_id: user.id, product_id: productId }).then();
        }
      }
      return newItems;
    });
  }, [user]);


  const isInWishlist = useCallback(
    (id: string) => items.includes(id),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, count: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
