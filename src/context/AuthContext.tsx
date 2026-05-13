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
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (addr: Omit<Address, "id">) => Promise<void>;
  updateAddress: (id: string, addr: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "date" | "status" | "paymentStatus">) => Promise<{ success: boolean; id?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  notifications: any[];
  clearNotification: (id: string) => void;
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
    try {
      console.log("Fetching profile for:", authUser.id);
      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

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

      // 2. Fetch User Orders
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

      // 3. Admin Data
      if (userData.role === 'admin') {
        const { data: ord } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        const { data: usr } = await supabase.from('profiles').select('*');
        if (ord) setAllOrders(ord.map((o: any) => ({
          id: o.id,
          date: o.created_at,
          items: o.items || [],
          total: o.total_amount,
          status: o.order_status,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          address: o.shipping_address,
          customerName: o.customer_name
        })));
        if (usr) setAllUsers(usr.map((p: any) => ({
          id: p.id, name: p.full_name, email: p.email, phone: p.phone, role: p.role, createdAt: p.created_at
        })));
      }
    } catch (err) {
      console.error("fetchUserData critical failure:", err);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking Supabase session...");
      
      const supabaseClient = supabase || getSupabase();
      
      if (!supabaseClient) {
        console.warn("Supabase client not initialized. Check your .env.local keys and RESTART your dev server.");
        setLoading(false);
        return;
      }

      const timeout = setTimeout(() => {
        console.warn("Session check timed out. Forcing loading to false.");
        setLoading(false);
      }, 2000); // 2 second safety timeout

      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) console.error("Supabase session error:", error);
        console.log("Session found:", !!session);
        if (session?.user) await fetchUserData(session.user);
      } catch (err) {
        console.error("Session check exception:", err);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
        console.log("Auth loading complete.");
      }
    };
    checkSession();

    const supabaseClient = supabase || getSupabase();
    if (supabaseClient) {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event: string, session: any) => {
        if (session?.user) {
          await fetchUserData(session.user);
        } else {
          setUser(null);
          setOrders([]);
          setAddresses([]);
          setAllOrders([]);
          setAllUsers([]);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [fetchUserData]);

  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    if (!supabase) return { success: false, error: "Supabase client not initialized" };
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Login error:", error.message);
        let userMessage = error.message;
        if (error.message.includes("Invalid login credentials")) userMessage = "Incorrect email or password. Please try again.";
        if (error.message.includes("Email not confirmed")) userMessage = "Please check your email and confirm your account first.";
        return { success: false, error: userMessage };
      }
      console.log("Login successful:", data.user?.id);
      return { success: true };
    } catch (err: any) {
      console.error("Login exception:", err);
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    console.log("Attempting signup for:", data.email);
    if (!supabase) return { success: false, error: "Supabase client not initialized" };

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { 
          data: { 
            full_name: data.name,
            phone: data.phone
          } 
        }
      });
  
      if (error) {
        console.error("Signup error:", error.message);
        let userMessage = error.message;
        if (error.message.includes("rate limit")) userMessage = "Too many attempts. Please try again in a few minutes.";
        if (error.message.includes("already registered")) userMessage = "This email is already associated with an account.";
        return { success: false, error: userMessage };
      }
      
      console.log("Signup successful for user:", authData.user?.id);
      return { 
        success: true, 
        confirmationRequired: !authData.session 
      };
    } catch (err: any) {
      console.error("Signup exception:", err);
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: data.name,
      phone: data.phone,
      avatar_url: data.avatar
    }).eq('id', user.id);
    
    if (!error) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
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
      payment_status: 'success', // Mock success for now
      order_status: 'ordered',
      shipping_address: orderData.address,
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone
    }).select().single();

    if (error) return { success: false, error: error.message };

    // Also insert items into order_items
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
      login, signup, adminLogin: login, logout, updateProfile,
      addAddress, updateAddress: async () => {}, removeAddress, setDefaultAddress,
      addOrder, updateOrderStatus, notifications: [], clearNotification: () => {},
    }}>
      {loading ? (
        <div className="min-h-screen bg-[#0a1810] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="font-poppins text-xs text-gold/60 tracking-widest uppercase animate-pulse">Authenticating...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
