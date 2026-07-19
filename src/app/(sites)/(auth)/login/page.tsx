"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/libs/contexts/AdminAuthContext';
import { Lock, Home } from 'lucide-react';
import toast from 'react-hot-toast';

// Login Form Component
const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isLoading: authLoading } = useAdminAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Login successful!");
        router.push("/");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-page flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-xl bg-[var(--accent-soft)]/60 border border-[var(--border-color)] flex items-center justify-center">
            <Lock className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-primary">Admin Sign In</h1>
            <p className="text-[11px] uppercase tracking-wider text-muted">Secure Access Portal</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="surface-card rounded-xl p-6 border border-[var(--border-color)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="emailorusername" className="text-[11px] font-medium tracking-wide uppercase text-muted">
                Email / Username
              </label>
              <input
                id="emailorusername"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-neutral text-sm px-3 py-2.5"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[11px] font-medium tracking-wide uppercase text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-neutral text-sm px-3 py-2.5"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-neutral text-sm font-medium py-2.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[var(--border-light)] border-t-[var(--text-primary)] rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-muted text-center leading-relaxed">
                Unauthorized access is prohibited. Your actions may be logged.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[10px] text-muted tracking-wide">© {new Date().getFullYear()} Admin Console</p>
        </div>
      </div>
    </div>
  );
}

export default Login;