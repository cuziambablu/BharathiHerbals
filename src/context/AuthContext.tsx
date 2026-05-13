"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase, getSupabase } from "@/lib/supabase";

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

export interface OrderItem {
  name: string;
  size: string;
  qty: number;
  price: number;
  image?: string;
}

export type OrderStatus = "ordered" | "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
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
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (addr: Omit<Address, "id">) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  addOrder: (order: any) => Promise<{ success: boolean; id?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  notifications: any[];
  clearNotification: (id: string) => void;
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

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

      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      
      if (userOrders) {
        setOrders(userOrders.map((o: any) => ({
          id: o.id,
          date: o.created_at,
          items: o.items || [],
          total: o.total_amount,
          status: o.order_status,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          address: o.shipping_address
        })));
      }

      if (userData.role === 'admin') {
        const { data: ord } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        const { data: usr } = await supabase.from('profiles').select('*');
        if (ord) setAllOrders(ord.map((o: any) => ({
          id: o.id, date: o.created_at, items: o.items || [], total: o.total_amount, status: o.order_status, paymentMethod: o.payment_method, paymentStatus: o.payment_status, address: o.shipping_address, customerName: o.customer_name
        })));
        if (usr) setAllUsers(usr.map((p: any) => ({
          id: p.id, name: p.full_name, email: p.email, phone: p.phone, role: p.role, createdAt: p.created_at
        })));
      }
    } catch (err) {
      console.error("fetchUserData error:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            await fetchUserData(session.user);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setOrders([]);
        setAddresses([]);
        setAllOrders([]);
        setAllUsers([]);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) await fetchUserData(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name, phone: data.phone } }
      });
      if (error) return { success: false, error: error.message };
      return { success: true, confirmationRequired: !authData.session };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    await supabase.from('profiles').update({
      full_name: data.name,
      phone: data.phone,
      avatar_url: data.avatar
    }).eq('id', user.id);
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const addAddress = async (addr: Omit<Address, "id">) => {
    if (!user) return;
    const newAddr = { ...addr, id: `addr_${Date.now()}` };
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
      user_id: user.id,
      total_amount: orderData.total,
      payment_method: orderData.paymentMethod,
      payment_status: 'success',
      order_status: 'ordered',
      shipping_address: orderData.address,
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone
    }).select().single();

    if (error) return { success: false, error: error.message };

    const itemsToInsert = orderData.items.map((item: any) => ({
      order_id: data.id,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
      bottle_size: item.size
    }));

    await supabase.from('order_items').insert(itemsToInsert);
    
    const newOrder: Order = {
      id: data.id,
      date: data.created_at,
      items: orderData.items,
      total: data.total_amount,
      status: 'ordered',
      paymentMethod: data.payment_method,
      paymentStatus: 'success',
      address: data.shipping_address
    };

    setOrders(prev => [newOrder, ...prev]);
    return { success: true, id: data.id };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    if (!error) {
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, isAdmin: user?.role === "admin",
      addresses, orders, allOrders, allUsers,
      login, signup, logout, updateProfile,
      addAddress, removeAddress, setDefaultAddress,
      addOrder, updateOrderStatus, notifications: [], clearNotification: () => {},
      loading
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
