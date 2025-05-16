import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import ConfirmDialog from "@k2600x/design-system/dist/components/ConfirmDialog";
import { Toaster } from "sonner";
import { ThemeScript } from "./ThemeScript";
import UserIndicator from "@/components/UserIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance dashboard",
  description: "By k2600x",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeScript />
        <Providers>
          <div style={{ padding: "1rem 0", textAlign: "right" }}>
            <UserIndicator />
          </div>
          {children}
          <ConfirmDialog />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
// Add ThemeScript component for toggling dark/light mode
// You will need to create this component next
