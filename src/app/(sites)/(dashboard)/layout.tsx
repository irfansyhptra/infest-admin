"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useAdminAuth,
} from "@/libs/contexts/AdminAuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--primary-bg)' }}>
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-[var(--border-light)] border-t-[var(--text-muted)] rounded-full animate-spin mx-auto mb-4" />
      <p className="text-[var(--text-muted)] text-sm tracking-wide">Loading...</p>
    </div>
  </div>
);

// Layout Content Component (handles auth state)
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAdminAuth();
  const router = useRouter();

  // Handle redirect in useEffect to avoid setState during render
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Show loading while redirecting
    return <LoadingScreen />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Main App Layout Component
const AppLayout = ({ children }: AppLayoutProps) => {
  return (
  <div className="min-h-screen" style={{ background: "var(--primary-bg)" }}>
      <LayoutContent>{children}</LayoutContent>
    </div>
  );
};

export default AppLayout;
