import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../css/globals.css";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider } from "@/libs/contexts/AdminAuthContext";
import NextTopLoader from "nextjs-toploader";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Panel - INFEST USK 2025",
  description: "Backoffice untuk manajemen Informatics Festival USK 2025",
  icons: {
    icon: [
      { url: "/images/HMIF-No-BG.png", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    shortcut: "/images/HMIF-No-BG.png",
    apple: [
      { url: "/images/HMIF-No-BG.png", type: "image/png" },
      { url: "/images/HMIF-No-BG.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/images/HMIF-No-BG.png",
        color: "#000000",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminAuthProvider>
          <NextTopLoader
            color="#3B82F6"
            initialPosition={0.2}
            crawlSpeed={200}
            height={2}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={300}
            zIndex={9999}
          />
          {children}
          <Toaster
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--card-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                duration: 3000,
                style: {
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--success)",
                },
                iconTheme: {
                  primary: "var(--success)",
                  secondary: "var(--card-bg)",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--error)",
                },
                iconTheme: {
                  primary: "var(--error)",
                  secondary: "var(--card-bg)",
                },
              },
              loading: {
                style: {
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--brand-primary)",
                },
                iconTheme: {
                  primary: "var(--brand-primary)",
                  secondary: "var(--card-bg)",
                },
              },
            }}
          />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
