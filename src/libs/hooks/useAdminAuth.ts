"use client";

import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/libs/contexts/AdminAuthContext';
import { useEffect } from 'react';

/**
 * Hook untuk proteksi halaman yang membutuhkan autentikasi admin
 */
export function useAdminProtection() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook untuk redirect jika sudah login (untuk halaman login)
 */
export function useAdminAuthRedirect() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
