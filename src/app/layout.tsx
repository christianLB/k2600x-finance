import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
//import ConfirmDialog from "@k2600x/design-system/dist/components/ConfirmDialog";
import { Toaster } from "sonner";
import { ThemeScript } from "./ThemeScript";

const interFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
  // Note: We remove the ClientHeader from here
  // and will only use it in non-admin layouts
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${interFont.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeScript />
        <Providers>
          {/* ClientHeader removed from here to avoid duplication */}
          {children}
          {/* <ConfirmDialog /> */}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
// Add ThemeScript component for toggling dark/light mode
// You will need to create this component next
