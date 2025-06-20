import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { ConfirmDialog } from "@/components/ui";
import { Toaster } from "sonner";
import { ThemeScript } from "./ThemeScript";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });


export const metadata: Metadata = {
  title: "Finance dashboard",
  description: "By k2600x",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: We remove the ClientHeader from here
  // and will only use it in non-admin layouts
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeScript />
        <Providers>
          {/* ClientHeader removed from here to avoid duplication */}
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
