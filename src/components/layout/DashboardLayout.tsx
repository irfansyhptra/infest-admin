"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/libs/contexts/AdminAuthContext";
import {
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Trophy,
  Users,
  User,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { is } from "date-fns/locale";

interface MenuItem {
  label: string;
  href: string;
  isActive?: boolean;
  icon: any;
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: "/",
      isActive: pathname === "/",
      icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
    },
    {
      label: "Users",
      href: "/users",
      isActive: pathname.startsWith("/users"),
      icon: <User className="w-4 h-4 flex-shrink-0" />,
    },
    {
      label: "Competitions",
      href: "/competitions",
      isActive: pathname.startsWith("/competitions"),
      icon: <Trophy className="w-4 h-4 flex-shrink-0" />,
    },
    {
      label: "Teams",
      href: "/teams",
      isActive: pathname.startsWith("/teams"),
      icon: <Users className="w-4 h-4 flex-shrink-0" />,
    },
    // Hanya super admin. Ini sekadar menyembunyikan menu — penegakan yang
    // sesungguhnya ada di requireSuperAdmin() pada API route-nya.
    ...(user?.role === "SUPER_ADMIN"
      ? [
          {
            label: "Kelola Admin",
            href: "/admins",
            isActive: pathname.startsWith("/admins"),
            icon: <ShieldCheck className="w-4 h-4 flex-shrink-0" />,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle click outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--primary-bg)" }}
    >
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 select-none
          bg-[var(--secondary-bg)] border-r border-[var(--border-color)] shadow-sm
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center ${
            isSidebarOpen ? "justify-between" : "justify-center"
          } h-14 px-4 border-b border-[var(--border-color)]`}
        >
          {isSidebarOpen && (
            <div className="transition-opacity duration-300">
              <h1 className="text-sm tracking-wide font-semibold text-[var(--text-primary)]">
                ADMIN PANEL
              </h1>
              <p className="text-[10px] mt-0.5 text-[var(--text-subtle)] uppercase tracking-wider">
                Informatics Festival
              </p>
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden absolute border border-[var(--border-color)] -right-8 lg:flex items-center justify-center w-8 h-8 rounded-r-lg hover:bg-[var(--tertiary-bg)] transition-colors bg-[var(--accent-bg)]"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-[var(--text-subtle)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-subtle)]" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-4 px-3 py-2.5 rounded-md text-sm tracking-wide font-medium transition-all
                  ${
                    item.isActive
                      ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-primary)]"
                  }
                  ${!isSidebarOpen ? "justify-center" : ""}
                `}
                title={!isSidebarOpen ? item.label : ""}
              >
                {item.icon}
                {isSidebarOpen && (
                  <span className="transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div
            className={`
              flex items-center space-x-3 mb-3
              ${!isSidebarOpen ? "justify-center" : ""}
            `}
          >
            <div className="w-8 h-8 bg-[var(--accent-soft)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            {isSidebarOpen && (
              <div
                className={`
                transition-all duration-300 w-3/4
              `}
              >
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user?.email || "Administrator"}
                </p>
                <p className="text-xs text-[var(--text-subtle)]">Admin</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center px-3 py-2 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--accent-bg)] transition-colors text-sm
              ${!isSidebarOpen ? "justify-center" : ""}
            `}
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span className="pl-2">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="fixed top-0 w-screen lg:hidden h-14 flex items-center justify-between px-4 bg-[var(--secondary-bg)] border-b border-[var(--border-color)]">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
          >
            <Menu className="w-5 h-5 text-[var(--text-subtle)]" />
          </button>
          <h1 className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">
            ADMIN PANEL
          </h1>
          <div className="w-8 h-8" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 p-4 pt-20 lg:p-12 ${
            !isSidebarOpen ? "lg:pl-[8rem]" : "lg:pl-[19rem]"
          } transition-all duration-300`}
          style={{ background: "var(--primary-bg)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
