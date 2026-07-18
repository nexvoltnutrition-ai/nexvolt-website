import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  points: number;
  gender?: string;
  dob?: string;
  created_at?: string;
}

interface AdminRecord {
  id: string;
  email: string;
  role: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  customerData: CustomerRecord | null;
  adminData: AdminRecord | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateCustomerData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  customerData: null,
  adminData: null,
  loading: true,
  logout: async () => {},
  updateCustomerData: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customerData, setCustomerData] = useState<CustomerRecord | null>(null);
  const [adminData, setAdminData] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (currentUser: User) => {
    // Check if it's an admin
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', currentUser.email || '')
      .maybeSingle();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error("fetchUserData admin error:", adminError);
    }

    if (admin) {
      const validRoles = ['super admin', 'admin', 'manager', 'content manager', 'support'];
      if (admin.active && admin.role && validRoles.includes(admin.role.toLowerCase())) {
        console.log("[Auth] Admin Verification: Success for", currentUser.email);
        setAdminData(admin as AdminRecord);
      } else {
        // If inactive or invalid role, log them out
        console.error("AuthContext invalid admin record:", admin);
        console.log("[Auth] Admin Verification: Failed (inactive or invalid role)");
        await supabase.auth.signOut();
        return;
      }
    } else {
      // Must be a customer
      console.log("[Auth] Admin Verification: Not an admin, treating as customer");
      await updateCustomerData(currentUser);
    }
  };

  const updateCustomerData = async (currentUser?: User) => {
    const targetUser = currentUser || user;
    if (!targetUser) return;

    try {
      let query = supabase.from('customers').select('*');
      if (targetUser.email) {
        query = query.eq('email', targetUser.email);
      } else if (targetUser.phone) {
        query = query.eq('phone', targetUser.phone);
      } else {
        console.error("User has neither email nor phone");
        return;
      }

      const { data: customers, error } = await query.limit(1);
      
      if (error) {
         console.error('Error fetching customer data:', error);
      }

      const customer = customers?.[0];

      if (customer) {
        console.log("Existing customer found for:", targetUser.email || targetUser.phone, customer);
        setCustomerData(customer as CustomerRecord);
      } else {
        console.log("No existing customer found, creating new for:", targetUser.email || targetUser.phone);
        const customerPayload = {
          name: targetUser.user_metadata?.full_name || 'New Customer',
          email: targetUser.email,
          phone: targetUser.phone,
          tier: 'Silver',
          points: 0
        };
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([customerPayload])
          .select()
          .maybeSingle();

        if (insertError) {
          console.error('Error creating customer record:', insertError);
        } else if (newCustomer) {
          setCustomerData(newCustomer as CustomerRecord);
        }
      }
    } catch (e) {
      console.error('Error fetching customer data:', e);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("[Auth] Session Loaded");
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
         await fetchUserData(initialSession.user);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchUserData(newSession.user);
      } else {
        setCustomerData(null);
        setAdminData(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log("[Auth] Logout");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      customerData,
      adminData,
      loading,
      logout,
      updateCustomerData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
