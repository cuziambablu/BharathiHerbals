"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus = "ordered" | "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface Order {
  id: string;
  date: string;
  items: any[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: "success" | "pending" | "failed";
  address: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  addresses: Address[];
  orders: Order[];
  allOrders: Order[];
  allUsers: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (addr: Omit<Address, "id">) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  addOrder: (order: any) => Promise<{ success: boolean; id?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (authUser: any) => {
    if (!authUser) return;
    try {
      console.log("🔍 [AUTH] Fetching profile for:", authUser.email);
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      
      const userData: User = {
        id: authUser.id,
        name: profile?.full_name || authUser.user_metadata?.full_name || "User",
        email: authUser.email || "",
        phone: profile?.phone || authUser.user_metadata?.phone || "",
        role: (profile?.role as UserRole) || "user",
        avatar: profile?.avatar_url,
        createdAt: authUser.created_at,
      };
      
      setUser(userData);
      if (profile?.addresses) setAddresses(profile.addresses);

      // Background fetches - don't block
      supabase.from('orders').select(`
        *,
        order_items (*)
      `).eq('user_id', authUser.id).order('created_at', { ascending: false }).then(({ data }: { data: any }) => {
        if (data) setOrders(data.map((o: any) => ({
          id: o.id, 
          date: o.created_at, 
          items: o.order_items?.map((i: any) => ({
            name: i.product_name,
            size: i.bottle_size,
            qty: i.quantity,
            price: i.price,
            image: i.image_url // Note: this column might be empty if not saved
          })) || [], 
          total: o.total_amount, 
          status: o.order_status,
          paymentMethod: o.payment_method, 
          paymentStatus: o.payment_status, 
          address: o.shipping_address
        })));
      });

      if (userData.role === 'admin') {
        supabase.from('orders').select(`
          *,
          order_items (*)
        `).order('created_at', { ascending: false }).then(({ data }: { data: any }) => {
          if (data) setAllOrders(data.map((o: any) => ({
            id: o.id, 
            date: o.created_at, 
            items: o.order_items?.map((i: any) => ({
              name: i.product_name,
              size: i.bottle_size,
              qty: i.quantity,
              price: i.price
            })) || [], 
            total: o.total_amount, 
            status: o.order_status,
            paymentMethod: o.payment_method, 
            paymentStatus: o.payment_status, 
            address: o.shipping_address, 
            customerName: o.customer_name
          })));
        });
        supabase.from('profiles').select('*').then(({ data }: { data: any }) => {
          if (data) setAllUsers(data.map((p: any) => ({
            id: p.id, name: p.full_name, email: p.email, phone: p.phone, role: p.role, createdAt: p.created_at
          })));
        });
      }
    } catch (err) {
      console.error("fetchUserData error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [fetchUserData]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) await fetchUserData(data.user);
    return { success: true };
  };

  const adminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      return { success: false, error: "Unauthorized access: Admin only." };
    }

    if (data.user) await fetchUserData(data.user);
    return { success: true };
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name, phone: data.phone } }
    });
    if (error) return { success: false, error: error.message };
    if (authData.user) await fetchUserData(authData.user);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    await supabase.from('profiles').update({ full_name: data.name, phone: data.phone, avatar_url: data.avatar }).eq('id', user.id);
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const addAddress = async (addr: Omit<Address, "id">) => {
    if (!user) return;
    const newAddr = { ...addr, id: Math.random().toString(36).substr(2, 9), isDefault: addresses.length === 0 };
    const newAddresses = [...addresses, newAddr];
    await supabase.from('profiles').update({ addresses: newAddresses }).eq('id', user.id);
    setAddresses(newAddresses);
  };

  const removeAddress = async (id: string) => {
    if (!user) return;
    const newAddresses = addresses.filter(a => a.id !== id);
    await supabase.from('profiles').update({ addresses: newAddresses }).eq('id', user.id);
    setAddresses(newAddresses);
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    const newAddresses = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    await supabase.from('profiles').update({ addresses: newAddresses }).eq('id', user.id);
    setAddresses(newAddresses);
  };

  const addOrder = async (orderData: any) => {
    if (!user) return { success: false, error: "Not logged in" };
    const { data, error } = await supabase.from('orders').insert({
      user_id: user.id, total_amount: orderData.total, payment_method: orderData.paymentMethod,
      payment_status: 'success', order_status: 'ordered', shipping_address: orderData.address,
      customer_name: user.name, customer_email: user.email, customer_phone: user.phone
    }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, id: data.id };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    if (!error) setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, isAdmin: user?.role === "admin",
      addresses, orders, allOrders, allUsers,
      login, adminLogin, signup, logout, updateProfile,
      addAddress, removeAddress, setDefaultAddress,
      addOrder, updateOrderStatus, loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
