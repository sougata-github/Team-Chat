import "./globals.css";

import { ConvexProvider } from "@/components/providers/ConvexProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Geist, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";


const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Team Chat",
  description: "Discord clone built using NextJS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.className)}>
          <ConvexProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="team-chat-theme"
            >
              {children}
            </ThemeProvider>
          </ConvexProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
