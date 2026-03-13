import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { GamificationProvider } from "../contexts/GamificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenith - Productivity Suite",
  description: "A monochrome, award-winning style productivity application for mastering your time and focus.",
  keywords: ["productivity", "task management", "habits", "goals", "focus", "pomodoro"],
  authors: [{ name: "Zenith Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
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
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <GamificationProvider>
              {children}
            </GamificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
