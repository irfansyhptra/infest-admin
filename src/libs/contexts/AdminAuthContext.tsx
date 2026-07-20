"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminAuthContextType, AdminUser } from '@/types/admin';
import { adminAuthService } from '@/libs/services/adminAuthService';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and listen for auth changes
  useEffect(() => {
    let cancelled = false;
    let isCheckingAuth = true;

    const checkAuth = async () => {
      try {
        const currentUser = await adminAuthService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch (error) {
        console.error('Check auth error:', error);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          isCheckingAuth = false;
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Listen to auth state changes
    const { data: { subscription } } = adminAuthService.onAuthStateChange((user) => {
      if (cancelled) return;
      setUser(user);
      if (!isCheckingAuth) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await adminAuthService.login(emailOrUsername, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Terjadi kesalahan sistem' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      const currentUser = await adminAuthService.refreshAuth();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh auth error:', error);
      setUser(null);
    }
  };

  const value: AdminAuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refreshAuth
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
